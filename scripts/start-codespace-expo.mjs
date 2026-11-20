import { spawn, spawnSync } from 'node:child_process';
import { constants, closeSync, existsSync, mkdirSync, openSync, readFileSync, readlinkSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIGURED_EXPO_OWNER = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')).expo.owner;
const STATE = join(homedir(), '.cache', 'tio-money-expo-preview');
const PID_FILE = join(STATE, 'metro.json');
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

function managedRecord() {
  if (!existsSync(PID_FILE)) return null;
  try {
    const data = JSON.parse(readFileSync(PID_FILE, 'utf8'));
    return recordMatches(data, identity(data.pid)) ? data : null;
  } catch {
    return null;
  }
}

async function request(path, json = false, port = PORT) {
  try {
    const response = await fetch('http://127.0.0.1:' + port + path, {
      signal: AbortSignal.timeout(1800),
    });
    if (!response.ok) return null;
    return json ? await response.json() : await response.text();
  } catch {
    return null;
  }
}

export async function metroReady(port = PORT) {
  const body = await request('/status', false, port);
  return typeof body === 'string' && body.trim() === 'packager-status:running';
}

export async function tunnelReady(port = PORT) {
  const body = await request('/_expo/open?platform=ios&runtime=expo', true, port);
  return validExpoGoTunnel(body?.url);
}

async function portIsFree() {
  await new Promise((ok, fail) => {
    const server = createServer();
    server.once('error', (error) => {
      fail(error.code === 'EADDRINUSE'
        ? new Error('Metro port 8081 is occupied; refusing to control an unowned process.')
        : error);
    });
    server.listen(PORT, '127.0.0.1', () => {
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
  const record = managedRecord();
  if (!record) {
    if (await metroReady()) throw new Error('An unowned Metro server is running; refusing to stop it.');
    rmSync(PID_FILE, { force: true });
    return;
  }
  if (!recordMatches(record, identity(record.pid))) {
    throw new Error('Process ownership changed; refusing to signal it.');
  }
  try { process.kill(-record.pid, 'SIGTERM'); } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (!recordMatches(record, identity(record.pid)) && !(await metroReady())) {
      rmSync(PID_FILE, { force: true });
      return;
    }
    await wait(300);
  }
  throw new Error('Managed Metro did not stop within 10s; inspect the private Codespace log manually.');
}

async function startManaged() {
  await portIsFree();
  const logFd = openSync(LOG_FILE, constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW, 0o600);
  let child;
  try {
    child = spawn('npm', ['run', 'mobile'], {
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
  const record = { pid: child.pid, startTicks: proc.startTicks };
  writeFileSync(PID_FILE, JSON.stringify(record), { mode: 0o600 });
  child.unref();
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (exited || !recordMatches(record, identity(record.pid))) {
      rmSync(PID_FILE, { force: true });
      throw new Error('Expo exited before Metro and the tunnel were ready. Inspect the private log.');
    }
    if ((await metroReady()) && (await tunnelReady())) {
      console.log('Tio Money Expo Go tunnel ready; managed Metro serves port 8081.');
      return;
    }
    await wait(1000);
  }
  if (recordMatches(record, identity(record.pid))) {
    try { process.kill(-record.pid, 'SIGTERM'); } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  }
  throw new Error('Metro and tunnel not ready within 180s. Inspect the private log and retry --restart.');
}

async function main() {
  if (process.platform !== 'linux' || !existsSync('/proc')) {
    throw new Error('This managed starter supports Linux Codespaces only.');
  }
  const flags = process.argv.slice(2);
  if (flags.length > 1 || flags.some((x) => !['--start', '--stop', '--status', '--restart'].includes(x))) {
    throw new Error('Usage: node scripts/start-codespace-expo.mjs [--start|--status|--restart|--stop]');
  }
  await withLock(async () => {
    const current = managedRecord();
    if (flags.includes('--status')) {
      if (!current || !(await metroReady()) || !(await tunnelReady())) {
        throw new Error('No healthy project-owned Metro and tunnel are running.');
      }
      console.log('Tio Money Expo Go tunnel healthy on port 8081.');
      return;
    }
    if (flags.includes('--stop')) {
      await stopManaged();
      console.log('Project-owned Expo server stopped (or was not running).');
      return;
    }
    requireExpoAccount();
    if (flags.includes('--restart')) await stopManaged();
    else if (current) {
      if ((await metroReady()) && (await tunnelReady())) {
        console.log('Expo tunnel already healthy; no duplicate Metro started.');
        return;
      }
      throw new Error('Managed Metro exists but is unhealthy; inspect the private log and use --restart.');
    }
    await startManaged();
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error('Tio Money preview: ' + error.message);
    process.exitCode = 1;
  });
}
