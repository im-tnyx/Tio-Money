import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { constants, closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, readlinkSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { TextDecoder } from 'node:util';

import { managedListener } from '../.github/scripts/preflight-pr-codespaces-preview.mjs';

const streamed = process.argv[1] === '-';
const ROOT = streamed ? '/workspaces/Tio-Money' : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIGURED_EXPO_OWNER = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')).expo.owner;
const STATE = join(homedir(), '.cache', 'tio-money-expo-preview');
const PID_FILE = join(STATE, 'metro.json');
const DEPENDENCY_MARKER = join(STATE, 'preview-dependency-manifests.sha256');
const LOCK_FILE = join(STATE, 'startup.lock');
const LOG_FILE = join(STATE, 'metro.log');
const PORT = 8081;
const START_TIMEOUT_MS = 180_000;

export function parseStartTicks(stat) {
  const marker = stat.lastIndexOf(')');
  if (marker < 0) return null;
  return stat.slice(marker + 1).trim().split(/\s+/)[19] || null;
}

export function isMobileCommand(command) {
  // GitHub Codespaces commonly runs npm via Node's npm-cli.js, not an npm executable.
  return /(?:^|[\s/])npm(?:-cli)?(?:\.js)?\s+run\s+mobile(?:\s|$)/.test(command);
}

export function validExpoGoTunnel(raw) {
  if (typeof raw !== 'string') return false;
  try {
    const url = new URL(raw);
    return ['exp:', 'exps:'].includes(url.protocol)
      && (url.hostname.endsWith('.on.expo.app') || url.hostname.endsWith('.exp.direct'))
      && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function metroChildEnvironment(parentEnv = process.env) {
  // Expo SDK 58 accepts CI only as true/false/1/0; an empty string crashes Metro startup.
  // This local Expo Go preview is interactive, not an unattended CI build.
  return { ...parentEnv, EXPO_NO_TELEMETRY: '1', CI: 'false' };
}

export function validWhoami(result, expectedOwner = CONFIGURED_EXPO_OWNER) {
  if (result.status !== 0 || result.error || typeof expectedOwner !== 'string') return false;
  if (!/^[a-z0-9][a-z0-9_.-]{0,63}$/i.test(expectedOwner)) return false;
  // Exact-account equality is required: do not connect Tio Money under Tio-TNYX.
  return String(result.stdout || '').trim() === expectedOwner;
}

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

function identity(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 1) return null;
  try {
    return {
      startTicks: parseStartTicks(readFileSync('/proc/' + pid + '/stat', 'utf8')),
      cwd: resolve(readlinkSync('/proc/' + pid + '/cwd')),
      command: readFileSync('/proc/' + pid + '/cmdline', 'utf8').replaceAll('\0', ' ').trim(),
    };
  } catch {
    return null;
  }
}

export function recordMatches(record, proc, projectRoot = ROOT) {
  return !!record && !!proc
    && Number.isSafeInteger(record.pid) && record.pid > 1
    && typeof record.startTicks === 'string' && record.startTicks.length > 0
    && record.startTicks === proc.startTicks
    && proc.cwd === projectRoot && isMobileCommand(proc.command);
}

const RUNTIME_INPUT = /^(?:(?:package(?:-lock)?|npm-shrinkwrap|app|tsconfig(?:\.[^/]+)?|jsconfig)\.json|\.(?:npmrc|nvmrc|node-version|babelrc(?:\.[^/]+)?)|(?:app|metro|babel)\.config\.[^/]+|(?:\.devcontainer|patches|plugins)\/.+|scripts\/start-codespace-expo\.mjs)$/u;

function gitOutput(root, ...args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0 || result.error) throw Error('Unable to verify preview Git state.');
  return result.stdout;
}

export function runtimeFingerprint(revision, root = ROOT) {
  if (!/^[0-9a-f]{40}$/.test(revision)) throw Error('Invalid preview runtime revision.');
  const tree = gitOutput(root, 'ls-tree', '-r', '-z', '--full-tree', revision);
  const runtimeEntries = tree.split('\0').filter((entry) =>
    RUNTIME_INPUT.test(entry.slice(entry.indexOf('\t') + 1)));
  const hash = createHash('sha256').update(process.version).update('\0').update(JSON.stringify(runtimeEntries));
  // Local Expo env files may influence Metro without appearing in Git. Never log their contents or digest.
  for (const name of ['.env', '.env.local', '.env.development', '.env.development.local']) {
    try {
      const value = readFileSync(join(root, name));
      hash.update(JSON.stringify([name, createHash('sha256').update(value).digest('hex')]));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return hash.digest('hex');
}

function dependencyStamp(revision) {
  const manifests = gitOutput(ROOT, 'ls-tree', '-r', '-z', '--full-tree', revision, '--',
    'package.json', 'package-lock.json', 'npm-shrinkwrap.json', '.npmrc', 'patches');
  return createHash('sha256').update(process.version).update('\0').update(manifests).digest('hex');
}

function dependenciesMatch(revision) {
  try {
    return existsSync(join(ROOT, 'node_modules/.package-lock.json')) &&
      readFileSync(DEPENDENCY_MARKER, 'utf8').trim() === dependencyStamp(revision);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

export function requireSyncSnapshot(expected, actual, status) {
  if (!/^[0-9a-f]{40}$/.test(expected) || actual !== expected || status !== '') {
    throw Error('Codespace checkout changed or became dirty before preview sync.');
  }
}

export function compatibleRuntime(record, fingerprint, dependenciesReady = true) {
  return !!record && dependenciesReady && record.runtimeFingerprint === fingerprint;
}

export function previewAction(current, metroHealthy, tunnelHealthy) {
  if (!current) return 'start';
  return metroHealthy && tunnelHealthy ? 'reuse' : 'recover';
}

// A missing record permits a new start only after checking the port. An
// unreadable, stale or unsafe record cannot authorize reuse or recovery.
function checkedManagedRecord() {
  let stat;
  try {
    stat = lstatSync(PID_FILE);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  if (!stat.isFile() || stat.uid !== process.getuid() || (stat.mode & 0o077) !== 0) {
    throw Error('Unsafe managed Metro ownership record.');
  }
  const fd = openSync(PID_FILE, constants.O_RDONLY | constants.O_NOFOLLOW);
  let data;
  try {
    data = JSON.parse(readFileSync(fd, 'utf8'));
  } finally {
    closeSync(fd);
  }
  if (!recordMatches(data, identity(data.pid))) {
    throw Error('Managed Metro ownership record is invalid; refusing automatic recovery.');
  }
  return data;
}

function verifyListener(record) {
  const state = managedListener(record, ROOT);
  if (state === 'FOREIGN') throw Error('Refusing to control a foreign or ambiguous Metro listener.');
  return state === 'OWNED';
}

export async function request(path, json = false, port = PORT) {
  try {
    const response = await fetch('http://127.0.0.1:' + port + path, {
      signal: AbortSignal.timeout(1800),
      redirect: 'error',
    });
    if (response.status !== 200 || response.redirected) return null;
    const reader = response.body?.getReader();
    if (!reader) return null;
    const decoder = new TextDecoder('utf-8', { fatal: true });
    let body = '';
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 65536) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return json ? JSON.parse(body) : body;
  } catch {
    return null;
  }
}

export async function metroReady(port = PORT) {
  const body = await request('/status', false, port);
  return typeof body === 'string' && body.trim() === 'packager-status:running';
}

async function tunnelUrl(port) {
  const body = await request('/_expo/open?platform=ios&runtime=expo', true, port);
  return validExpoGoTunnel(body?.url) ? body.url : null;
}

export async function tunnelReady(port = PORT) {
  return (await tunnelUrl(port)) !== null;
}

async function ownedTunnel(record) {
  const port = record.port ?? PORT;
  if (!verifyListener(record) || !(await metroReady(port))) return null;
  const url = await tunnelUrl(port);
  return verifyListener(record) ? url : null;
}

async function portIsFree(port = PORT) {
  await new Promise((ok, fail) => {
    const server = createServer();
    server.once('error', (error) => {
      fail(error.code === 'EADDRINUSE'
        ? new Error('Metro port is occupied; refusing to control an unowned process.')
        : error);
    });
    server.listen(port, '127.0.0.1', () => {
      server.close((error) => error ? fail(error) : ok());
    });
  });
}

async function withLock(task) {
  mkdirSync(STATE, { recursive: true, mode: 0o700 });
  const deadline = Date.now() + 30_000;
  let fd;
  while (Date.now() < deadline) {
    try {
      fd = openSync(LOCK_FILE, 'wx', 0o600);
      writeFileSync(fd, String(process.pid));
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let owner = 0;
      let age = 0;
      try {
        owner = Number(readFileSync(LOCK_FILE, 'utf8'));
        age = Date.now() - statSync(LOCK_FILE).mtimeMs;
      } catch {
        // Another starter may still be writing a new lock.
      }
      if (age > 5000 && (!Number.isSafeInteger(owner) || owner < 1 || !identity(owner))) {
        rmSync(LOCK_FILE, { force: true });
      }
      await wait(500);
    }
  }
  if (fd === undefined) throw new Error('Timed out waiting for the Expo startup lock.');
  try {
    return await task();
  } finally {
    closeSync(fd);
    try {
      if (readFileSync(LOCK_FILE, 'utf8').trim() === String(process.pid)) {
        rmSync(LOCK_FILE, { force: true });
      }
    } catch {
      // Never remove another invocation's lock.
    }
  }
}

function requireExpoAccount() {
  const bin = join(ROOT, 'node_modules', '.bin', 'expo');
  if (!existsSync(bin)) {
    throw new Error('Expo CLI is missing. Run npm ci --no-audit --no-fund in this Codespace.');
  }
  const result = spawnSync(bin, ['whoami'], {
    cwd: ROOT, timeout: 20_000, encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, EXPO_NO_TELEMETRY: '1' },
  });
  if (!validWhoami(result)) {
    throw new Error('Expo CLI must be signed in as the configured Tio Money owner (tnyx-23). Run npx expo login --no-browser in this Codespace, then retry. Never share credentials.');
  }
}

async function stopManaged() {
  const record = checkedManagedRecord();
  if (!record) {
    await portIsFree();
    rmSync(PID_FILE, { force: true });
    return;
  }
  verifyListener(record);
  if (!recordMatches(record, identity(record.pid))) {
    throw new Error('Process ownership changed; refusing to signal it.');
  }
  try { process.kill(-record.pid, 'SIGTERM'); } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (!recordMatches(record, identity(record.pid))) {
      await portIsFree(record.port ?? PORT);
      rmSync(PID_FILE, { force: true });
      return;
    }
    await wait(300);
  }
  throw new Error('Managed Metro did not stop within 10s; inspect the private Codespace log manually.');
}

export function candidatePorts(manual) {
  return manual ? [8081, 8082, 8083, 8084, 8085] : [8081];
}

export function startupFailureCategory(log) {
  if (/EADDRINUSE|port (?:is )?in use/i.test(log)) return 'PORT_CONFLICT';
  if (/not logged in|authentication failed|unauthorized/i.test(log)) return 'EXPO_AUTH';
  if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|network error/i.test(log)) return 'NETWORK';
  if (/Cannot find module|MODULE_NOT_FOUND/i.test(log)) return 'DEPENDENCY';
  return 'UNKNOWN';
}

function startupFailure() {
  // Emit only a fixed code, never raw logs, credentials or signed tunnel URLs.
  try {
    const stat = lstatSync(LOG_FILE);
    if (!stat.isFile() || stat.size > 2097152 || stat.uid !== process.getuid() || (stat.mode & 0o077) !== 0) return 'UNKNOWN';
    const fd = openSync(LOG_FILE, constants.O_RDONLY | constants.O_NOFOLLOW);
    try { return startupFailureCategory(readFileSync(fd, 'utf8').slice(-65536)); }
    finally { closeSync(fd); }
  } catch { return 'UNKNOWN'; }
}

async function selectPort(manual) {
  for (const port of candidatePorts(manual)) {
    try { await portIsFree(port); return port; }
    catch (error) { if (!manual || !error.message.includes('port is occupied')) throw error; }
  }
  throw Error('No free managed preview port in the approved range.');
}

async function startManaged(fingerprint, manual = false) {
  const port = await selectPort(manual);
  const logFd = openSync(LOG_FILE, constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW, 0o600);
  let child;
  try {
    child = spawn('npm', ['run', 'mobile', '--', '--port', String(port)], {
      cwd: ROOT, detached: true, stdio: ['ignore', logFd, logFd],
      env: metroChildEnvironment(),
    });
  } finally {
    closeSync(logFd);
  }
  if (!child.pid) throw new Error('Unable to launch Metro; inspect the private Codespace log.');
  let exited = false;
  child.once('exit', () => { exited = true; });
  child.once('error', () => { exited = true; });
  let proc;
  const idDeadline = Date.now() + 3000;
  while (Date.now() < idDeadline && !exited) {
    proc = identity(child.pid);
    if (proc && proc.cwd === ROOT && isMobileCommand(proc.command) && proc.startTicks) break;
    await wait(100);
  }
  if (!proc || proc.cwd !== ROOT || !proc.startTicks || !isMobileCommand(proc.command)) {
    child.kill('SIGTERM'); // This process was launched by this invocation.
    throw new Error('Launched process identity could not be verified.');
  }
  const record = { pid: child.pid, startTicks: proc.startTicks, runtimeFingerprint: fingerprint, port };
  writeFileSync(PID_FILE, JSON.stringify(record), { mode: 0o600 });
  child.unref();
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (exited || !recordMatches(record, identity(record.pid))) {
      rmSync(PID_FILE, { force: true });
      throw new Error(`Expo exited before Metro/tunnel readiness (${startupFailure()}).`);
    }
    if (verifyListener(record) && (await metroReady(port)) && (await tunnelReady(port)) && verifyListener(record)) {
      console.log(`Tio Money Expo Go tunnel ready; managed Metro serves port ${port}.`);
      return;
    }
    await wait(1000);
  }
  if (recordMatches(record, identity(record.pid))) {
    verifyListener(record);
    try { process.kill(-record.pid, 'SIGTERM'); } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  }
  throw new Error(`Metro/tunnel readiness timed out (${startupFailure()}).`);
}

async function syncSelected(current, before, target, manual = false) {
  if (!/^[0-9a-f]{40}$/.test(target) || gitOutput(ROOT, 'rev-parse', 'FETCH_HEAD^{commit}').trim() !== target) {
    throw Error('Prepared bundle commit no longer matches the selected revision.');
  }
  requireSyncSnapshot(before, gitOutput(ROOT, 'rev-parse', 'HEAD').trim(),
    gitOutput(ROOT, 'status', '--porcelain=v1', '--untracked-files=normal'));
  const fingerprint = runtimeFingerprint(target);
  const dependenciesReady = dependenciesMatch(target);

  // Stop an incompatible owned process before changing the files it is using.
  // Hold the startup lock through source switch, install and managed restart.
  let managed = current;
  if (current && (manual || !compatibleRuntime(current, fingerprint, dependenciesReady))) {
    await stopManaged();
    managed = null;
  }
  const previousTunnel = managed ? await ownedTunnel(managed) : null;
  requireSyncSnapshot(before, gitOutput(ROOT, 'rev-parse', 'HEAD').trim(),
    gitOutput(ROOT, 'status', '--porcelain=v1', '--untracked-files=normal'));
  if (before !== target) {
    gitOutput(ROOT, '-c', 'advice.detachedHead=false', 'switch', '--detach', target);
  }
  if (!dependenciesReady) {
    const install = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: ROOT, stdio: 'inherit' });
    if (install.status !== 0 || install.error) throw Error('Unable to install locked preview dependencies.');
    writeFileSync(DEPENDENCY_MARKER, dependencyStamp(target) + '\n', { mode: 0o600 });
  }
  requireSyncSnapshot(target, gitOutput(ROOT, 'rev-parse', 'HEAD').trim(),
    gitOutput(ROOT, 'status', '--porcelain=v1', '--untracked-files=normal'));
  if (runtimeFingerprint(target) !== fingerprint || !dependenciesMatch(target)) {
    throw Error('Preview runtime inputs changed during synchronization.');
  }
  if (previousTunnel) {
    const currentRecord = checkedManagedRecord();
    if (!currentRecord || currentRecord.pid !== managed.pid ||
        currentRecord.startTicks !== managed.startTicks || await ownedTunnel(currentRecord) !== previousTunnel) {
      throw Error('Source synchronized, but the existing Metro/tunnel session could not be confirmed.');
    }
    console.log('Exact preview checkout synchronized; compatible Metro PID and tunnel reused.');
    return;
  }
  requireExpoAccount();
  if (managed) await stopManaged();
  await startManaged(fingerprint, manual);
}

async function main() {
  if (process.platform !== 'linux' || !existsSync('/proc')) {
    throw new Error('This managed starter supports Linux Codespaces only.');
  }
  const flags = process.argv.slice(2);
  if (streamed && (flags.length === 3 || flags.length === 4) && flags[0] === '--sync-selected') {
    const [, before, target, mode] = flags;
    if (mode !== undefined && mode !== '' && mode !== '--manual') throw Error('Invalid sync mode.');
    await withLock(async () => {
      const current = checkedManagedRecord();
      if (current) verifyListener(current);
      else if (mode !== '--manual') await portIsFree();
      await syncSelected(current, before, target, mode === '--manual');
    });
    return;
  }
  if (flags.length > 1 || flags.some((x) => !['--start', '--stop', '--status', '--restart', '--check-account', '--preflight'].includes(x))) {
    throw new Error('Usage: node scripts/start-codespace-expo.mjs [--start|--status|--restart|--stop|--check-account|--preflight]');
  }
  await withLock(async () => {
    const current = checkedManagedRecord();
    const listening = current && verifyListener(current);
    if (flags.includes('--preflight')) {
      if (!current) await portIsFree();
      console.log(current ? 'Verified managed Metro ownership.' : 'No managed Metro occupies the preview port.');
      return;
    }
    if (flags.includes('--check-account')) {
      requireExpoAccount();
      console.log('Expo account verified for the configured Tio Money owner.');
      return;
    }
    const revision = gitOutput(ROOT, 'rev-parse', 'HEAD').trim();
    const fingerprint = runtimeFingerprint(revision);
    const compatible = compatibleRuntime(current, fingerprint, !streamed || dependenciesMatch(revision));
    if (flags.includes('--status')) {
      if (!compatible || !listening || !(await metroReady(current.port ?? PORT)) || !(await tunnelReady(current.port ?? PORT)) || !verifyListener(current)) {
        throw new Error('No healthy project-owned Metro and tunnel are running.');
      }
      console.log(`Tio Money Expo Go tunnel healthy on port ${current.port ?? PORT}.`);
      return;
    }
    if (flags.includes('--stop')) {
      await stopManaged();
      console.log('Project-owned Expo server stopped (or was not running).');
      return;
    }
    requireExpoAccount();
    if (flags.includes('--restart')) await stopManaged();
    else {
      const action = previewAction(current, compatible && listening && await metroReady(current.port ?? PORT), listening && await tunnelReady(current.port ?? PORT) && verifyListener(current));
      if (action === 'reuse') {
        console.log('Expo tunnel already healthy; no duplicate Metro started.');
        return;
      }
      if (action === 'recover') {
        // The lock is held throughout the ownership recheck and recovery.
        await stopManaged();
      }
    }
    await startManaged(fingerprint);
  });
}

if (streamed || (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error('Tio Money preview: ' + error.message);
    process.exitCode = 1;
  });
}
