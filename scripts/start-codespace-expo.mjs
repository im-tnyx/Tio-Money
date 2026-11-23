import { createHash, randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { constants, closeSync, existsSync, fstatSync, lstatSync, mkdirSync, openSync, readFileSync, readlinkSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { TextDecoder } from 'node:util';

import {
  currentBootId, groupListener, inspectManagedMetro, isMobileCommand, listeners, metroGroup,
  ownedMetro, processStat, readManagedRecord, retryOwnership,
} from '../.github/scripts/preflight-pr-codespaces-preview.mjs';

export { isMobileCommand };

const streamed = process.argv[1] === '-';
const ROOT = streamed ? '/workspaces/Tio-Money' : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIGURED_EXPO_OWNER = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')).expo.owner;
const STATE = join(homedir(), '.cache', 'tio-money-expo-preview');
const PID_FILE = join(STATE, 'metro.json');
const DEPENDENCY_MARKER = join(STATE, 'preview-dependency-manifests.sha256');
const LOG_FILE = join(STATE, 'metro.log');
const PORT = 8081;
const START_TIMEOUT_MS = 180_000;
const MANUAL_START_TIMEOUT_MS = 90_000;
const TERM_TIMEOUT_MS = 10_000;
const KILL_TIMEOUT_MS = 5_000;

export function parseStartTicks(stat) {
  const marker = stat.lastIndexOf(')');
  if (marker < 0) return null;
  return stat.slice(marker + 1).trim().split(/\s+/)[19] || null;
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
  return ownedMetro(record, proc, projectRoot);
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

async function checkedManagedRecord(recoverStale = false) {
  const record = readManagedRecord(PID_FILE);
  if (!record) return null;
  const inspect = () => inspectManagedMetro(record, ROOT);
  const { state } = await retryOwnership(inspect);
  if (state === 'OWNED_METRO') return record;
  if (!recoverStale) throw Error('STALE_RECORD: Run Live Expo Go Preview manually to recover the exited managed Metro.');
  await portIsFree(record.port ?? PORT);
  if ((await retryOwnership(inspect)).state !== 'STALE_RECORD') {
    throw Error('OWNERSHIP_CHANGED: Managed Metro state changed during stale-record recovery.');
  }
  rmSync(PID_FILE);
  console.log('STALE_RECORD_CLEARED: Managed Metro exited and its group and port are clear.');
  return null;
}

async function verifyListener(record) {
  const { state, listener } = await retryOwnership(() => inspectManagedMetro(record, ROOT));
  return state === 'OWNED_METRO' && listener === 'OWNED';
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
  if (!(await verifyListener(record)) || !(await metroReady(port))) return null;
  const url = await tunnelUrl(port);
  return await verifyListener(record) ? url : null;
}

async function portIsFree(port = PORT) {
  if (listeners(port).size) throw Error('PORT_OCCUPIED: Metro port is occupied; inspect the dedicated Codespace.');
  await new Promise((ok, fail) => {
    const server = createServer();
    server.once('error', (error) => {
      fail(error.code === 'EADDRINUSE'
        ? new Error('PORT_OCCUPIED: Metro port is occupied; inspect the dedicated Codespace.')
        : error);
    });
    server.listen(port, '127.0.0.1', () => {
      server.close((error) => error ? fail(error) : ok());
    });
  });
}

// flock serializes new callers, including stale marker cleanup. Keep a PID marker
// at the legacy path while holding it so a pre-upgrade devcontainer postStart
// still waits for this invocation rather than competing to launch Metro.
export async function withStartupLock(state, task, timeoutSeconds = 30) {
  mkdirSync(state, { recursive: true, mode: 0o700 });
  const directory = lstatSync(state);
  if (!directory.isDirectory() || directory.uid !== process.getuid() || (directory.mode & 0o077)) {
    throw Error('STATE_UNSAFE: Managed Metro state directory must be private.');
  }
  const fd = openSync(join(state, 'startup.flock'),
    constants.O_CREAT | constants.O_RDWR | constants.O_NOFOLLOW | constants.O_NONBLOCK, 0o600);
  const marker = join(state, 'startup.lock');
  let ownsMarker = false;
  try {
    const lock = fstatSync(fd);
    if (!lock.isFile() || lock.uid !== process.getuid() || (lock.mode & 0o077)) {
      throw Error('LOCK_UNSAFE: Metro startup lock must be a private regular file.');
    }
    const deadline = Date.now() + timeoutSeconds * 1000;
    await new Promise((done, fail) => {
      const child = spawn('/usr/bin/flock', ['--exclusive', '--timeout', String(timeoutSeconds),
        '--conflict-exit-code', '75', '3'], { stdio: ['ignore', 'ignore', 'ignore', fd] });
      child.once('error', () => fail(Error('LOCK_UNAVAILABLE: Linux flock is required in the preview Codespace.')));
      child.once('exit', (code) => {
        if (code === 0) done();
        else fail(Error(code === 75 ? 'LOCK_TIMEOUT: Another preview lifecycle operation is still running.'
          : 'LOCK_UNAVAILABLE: Could not acquire the Metro startup lock.'));
      });
    });
    do {
      try {
        writeFileSync(marker, String(process.pid), { flag: 'wx', mode: 0o600 });
        ownsMarker = true;
        break;
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        const stat = lstatSync(marker, { throwIfNoEntry: false });
        if (!stat) continue;
        if (!stat.isFile() || stat.uid !== process.getuid() || (stat.mode & 0o077) || stat.size > 32) {
          throw Error('LOCK_UNSAFE: Legacy Metro startup marker is not a private PID file.');
        }
        const owner = Number(readFileSync(marker, 'utf8'));
        const ownerStat = Number.isSafeInteger(owner) && owner > 1 ? processStat(owner) : null;
        if (Date.now() - stat.mtimeMs > 5000 && (!ownerStat || ['Z', 'X'].includes(ownerStat.state))) {
          const current = lstatSync(marker, { throwIfNoEntry: false });
          if (current?.ino === stat.ino && current.dev === stat.dev) rmSync(marker);
          continue;
        }
      }
      await wait(250);
    } while (Date.now() < deadline);
    if (!ownsMarker) throw Error('LOCK_TIMEOUT: Legacy Codespace Metro startup is still running.');
    return await task();
  } finally {
    try { if (ownsMarker) rmSync(marker, { force: true }); }
    finally { closeSync(fd); }
  }
}

const withLock = (task) => withStartupLock(STATE, task);

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

// Acquire a Linux pidfd for each member and verify its start ticks and
// group/session before sending any signal. A recycled numeric PID cannot receive
// a signal through the old process handle.
const PIDFD_SIGNAL = `import json, os, signal, sys

group, name = int(sys.argv[1]), sys.argv[2]
handles = []
try:
    for pid, ticks in json.load(sys.stdin):
        try:
            fd = os.pidfd_open(pid)
        except ProcessLookupError:
            continue
        path = f"/proc/{pid}"
        try:
            with open(path + "/stat") as stat:
                fields = stat.read().rsplit(")", 1)[1].split()
            if (fields[19] != ticks or int(fields[2]) != group or
                int(fields[3]) != group or os.stat(path).st_uid != os.getuid()):
                sys.exit(3)
        except FileNotFoundError:
            os.close(fd)
            continue
        handles.append(fd)
    for fd in handles:
        try:
            signal.pidfd_send_signal(fd, getattr(signal, name))
        except ProcessLookupError:
            pass
finally:
    for fd in handles:
        os.close(fd)
`;

export function signalMetroGroup(pid, group, name) {
  const result = spawnSync('/usr/bin/python3', ['-I', '-c', PIDFD_SIGNAL, String(pid), name], {
    input: JSON.stringify([...group]), stdio: ['pipe', 'ignore', 'ignore'], timeout: 5000,
  });
  if (result.status === 3) throw Error('SIGNAL_IDENTITY_CHANGED: Managed process identity changed before signaling.');
  if (result.status !== 0 || result.error) {
    throw Error('SIGNAL_FAILED: Could not safely signal managed Metro. Check Linux pidfd support and the private preview state.');
  }
}

async function verifiedRemaining(record, original, readGroup, verify) {
  const remaining = readGroup(record.pid);
  // If the leader exited, only the exact survivors of the verified TERM group
  // can be escalated. Never follow a new PID or an unverified group member.
  if (!remaining.has(record.pid)) {
    for (const [pid, ticks] of remaining) {
      if (original.get(pid) !== ticks) throw Error('GROUP_UNKNOWN: Unverified process remains in the managed Metro group.');
    }
    return remaining;
  }
  if (remaining.get(record.pid) !== record.startTicks) throw Error('PID_REUSED: Managed Metro PID changed during shutdown.');
  return (await verify(record)).group;
}

export async function stopOwnedMetro(record, {
  verify, readGroup, readListener, send, ensureFree, forceAfterTimeout = false,
  pause = wait, now = Date.now, log = console.log,
}) {
  const initial = await verify(record);
  if (initial.state === 'OWNED_METRO') {
    log('METRO_SIGTERM: Stopping verified managed Metro.');
    send(record.pid, initial.group, 'SIGTERM');
    const waitForGroup = async (timeout) => {
      const deadline = now() + timeout;
      while (readGroup(record.pid).size && now() < deadline) await pause(250);
    };
    await waitForGroup(TERM_TIMEOUT_MS);
    const remaining = await verifiedRemaining(record, initial.group, readGroup, verify);
    if (remaining.size) {
      if (!forceAfterTimeout) throw Error('STOP_TIMEOUT: Managed Metro did not exit after SIGTERM. Use manual Live Expo Go Preview to recover.');
      const port = record.port ?? PORT;
      if (await retryOwnership(() => readListener(port, remaining, record.pid)) === 'FOREIGN') {
        throw Error('FOREIGN_LISTENER: Refusing to escalate while an unverified listener occupies the managed port.');
      }
      log('METRO_SIGKILL: SIGTERM timed out; reverified surviving managed Metro processes.');
      send(record.pid, remaining, 'SIGKILL');
      await waitForGroup(KILL_TIMEOUT_MS);
    }
    if (readGroup(record.pid).size) {
      throw Error('STOP_TIMEOUT: Managed Metro group remains after shutdown. Inspect the private preview state.');
    }
  }
  await ensureFree(record.port ?? PORT);
}

async function stopManaged(record, manual = false) {
  if (!record) return;
  await stopOwnedMetro(record, {
    verify: (candidate) => retryOwnership(() => inspectManagedMetro(candidate, ROOT)),
    readGroup: metroGroup,
    readListener: groupListener,
    send: signalMetroGroup,
    ensureFree: portIsFree,
    forceAfterTimeout: streamed && manual,
  });
  rmSync(PID_FILE);
}

export function candidatePorts(manual, preferredPort = PORT) {
  if (!Number.isSafeInteger(preferredPort) || preferredPort < 8081 || preferredPort > 8085) {
    throw Error('Unapproved managed preview port.');
  }
  return manual ? [8081, 8082, 8083, 8084, 8085] : [preferredPort];
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

async function selectPort(manual, preferredPort) {
  for (const port of candidatePorts(manual, preferredPort)) {
    try { await portIsFree(port); return port; }
    catch (error) { if (!manual || !error.message.includes('port is occupied')) throw error; }
  }
  throw Error('No free managed preview port in the approved range.');
}

async function startAttempt(fingerprint, manual, preferredPort) {
  const port = await selectPort(manual, preferredPort);
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
  let exited = false;
  child.once('exit', () => { exited = true; });
  child.once('error', () => { exited = true; });
  if (!child.pid) {
    throw Error('START_FAILED: Unable to launch Metro; inspect the private Codespace log.');
  }
  const started = processStat(child.pid);
  let proc;
  const idDeadline = Date.now() + 5000;
  while (started && Date.now() < idDeadline && !exited) {
    proc = identity(child.pid);
    if (proc && proc.cwd === ROOT && isMobileCommand(proc.command) && proc.startTicks === started.startTicks) break;
    await wait(100);
  }
  if (!proc || proc.cwd !== ROOT || !proc.startTicks || !isMobileCommand(proc.command)) {
    if ((exited || !started || started.state === 'Z') && metroGroup(child.pid).size === 0) {
      await portIsFree(port);
      return { reason: 'START_EXITED', category: startupFailure() };
    }
    throw Error('START_IDENTITY_UNKNOWN: Could not verify the launched command. Inspect the dedicated Codespace.');
  }
  const record = {
    pid: child.pid, startTicks: proc.startTicks, bootId: currentBootId(), runtimeFingerprint: fingerprint, port,
  };
  const pending = join(STATE, 'metro-' + randomUUID() + '.tmp');
  try {
    writeFileSync(pending, JSON.stringify(record), { flag: 'wx', mode: 0o600 });
    renameSync(pending, PID_FILE);
  } finally { rmSync(pending, { force: true }); }
  child.unref();
  const deadline = Date.now() + (manual ? MANUAL_START_TIMEOUT_MS : START_TIMEOUT_MS);
  let reason = 'START_TIMEOUT';
  while (Date.now() < deadline) {
    if (exited) {
      reason = 'START_EXITED';
      break;
    }
    if (await ownedTunnel(record)) {
      console.log(`Tio Money Expo Go tunnel ready; managed Metro serves port ${port}.`);
      return null;
    }
    await wait(750);
  }
  const category = startupFailure();
  console.log(`${reason} (${category}): Checking ownership before startup cleanup.`);
  if (!streamed) throw Error(reason + ': Inspect the private Codespace log before further lifecycle actions.');
  await stopManaged(record, manual);
  return { reason, category };
}

export async function retryStartup(start, manual, pause = wait, log = console.log) {
  const first = await start();
  if (!first) return;
  if (manual && ['NETWORK', 'UNKNOWN'].includes(first.category)) {
    log(`METRO_START_RETRY: Retrying after clean shutdown (${first.reason}, ${first.category}).`);
    await pause(1000);
    const second = await start();
    if (!second) return;
    throw Error(`${second.reason} (${second.category}): Metro failed on its second attempt. Inspect the private Codespace log.`);
  }
  throw Error(`${first.reason} (${first.category}): Metro did not become ready. Inspect the private Codespace log.`);
}

async function startManaged(fingerprint, manual = false, preferredPort = PORT) {
  await retryStartup(() => startAttempt(fingerprint, manual, preferredPort), manual);
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
  const recoveryPort = current?.port ?? PORT;
  if (current && (manual || !compatibleRuntime(current, fingerprint, dependenciesReady))) {
    console.log(manual ? 'MANUAL_REFRESH: Replacing the managed preview for the selected PR commit.'
      : 'RUNTIME_CHANGED: Replacing an incompatible managed Metro.');
    await stopManaged(current, manual);
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
    const currentRecord = await checkedManagedRecord();
    if (!currentRecord || currentRecord.pid !== managed.pid ||
        currentRecord.startTicks !== managed.startTicks || await ownedTunnel(currentRecord) !== previousTunnel) {
      throw Error('Source synchronized, but the existing Metro/tunnel session could not be confirmed.');
    }
    console.log('Exact preview checkout synchronized; compatible Metro PID and tunnel reused.');
    return;
  }
  requireExpoAccount();
  if (managed) {
    console.log('METRO_UNHEALTHY: Recovering the managed Metro and tunnel.');
    await stopManaged(managed, manual);
  }
  await startManaged(fingerprint, manual, recoveryPort);
  requireSyncSnapshot(target, gitOutput(ROOT, 'rev-parse', 'HEAD').trim(),
    gitOutput(ROOT, 'status', '--porcelain=v1', '--untracked-files=normal'));
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
      const current = await checkedManagedRecord(mode === '--manual');
      if (!current && mode !== '--manual') await portIsFree();
      await syncSelected(current, before, target, mode === '--manual');
    });
    return;
  }
  if (flags.length > 1 || flags.some((x) => !['--start', '--stop', '--status', '--restart', '--check-account', '--preflight'].includes(x))) {
    throw new Error('Usage: node scripts/start-codespace-expo.mjs [--start|--status|--restart|--stop|--check-account|--preflight]');
  }
  await withLock(async () => {
    const current = await checkedManagedRecord();
    const listening = current && await verifyListener(current);
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
      if (!compatible || !listening || !(await metroReady(current.port ?? PORT)) || !(await tunnelReady(current.port ?? PORT)) || !(await verifyListener(current))) {
        throw new Error('No healthy project-owned Metro and tunnel are running.');
      }
      console.log(`Tio Money Expo Go tunnel healthy on port ${current.port ?? PORT}.`);
      return;
    }
    if (flags.includes('--stop')) {
      if (!current) await portIsFree();
      await stopManaged(current);
      console.log('Project-owned Expo server stopped (or was not running).');
      return;
    }
    requireExpoAccount();
    const recoveryPort = current?.port ?? PORT;
    if (flags.includes('--restart')) await stopManaged(current);
    else {
      const action = previewAction(current, compatible && listening && await metroReady(current.port ?? PORT), listening && await tunnelReady(current.port ?? PORT) && await verifyListener(current));
      if (action === 'reuse') {
        console.log('Expo tunnel already healthy; no duplicate Metro started.');
        return;
      }
      if (action === 'recover') {
        if (process.env.CODESPACES === 'true') {
          throw Error('MANUAL_RECOVERY_REQUIRED: Use the trusted Live Expo Go Preview action for Codespace recovery.');
        }
        await stopManaged(current);
      }
    }
    await startManaged(fingerprint, false, recoveryPort);
  });
}

if (streamed || (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error('Tio Money preview: ' + error.message);
    process.exitCode = 1;
  });
}
