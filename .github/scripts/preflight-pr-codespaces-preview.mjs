// Stream this trusted-main code over Codespaces SSH. It never loads a PR script.
import { readFileSync, readlinkSync, lstatSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:net';

const root = '/workspaces/Tio-Money';
const recordPath = join(homedir(), '.cache', 'tio-money-expo-preview', 'metro.json');

export function ownedMetro(record, proc) {
  return Number.isSafeInteger(record?.pid) && record.pid > 1
    && typeof record.startTicks === 'string' && /^[0-9]+$/.test(record.startTicks)
    && record.startTicks === proc?.startTicks
    && proc.cwd === root
    && /(?:^|[\s/])npm(?:-cli)?(?:\.js)?\s+run\s+mobile(?:\s|$)/.test(proc.command);
}

export function preflightDecision(recordPresent, record, proc, portFree, listener = 'EMPTY') {
  if (recordPresent) {
    if (!ownedMetro(record, proc)) throw Error('Managed Metro ownership is uncertain.');
    if (!['EMPTY', 'OWNED'].includes(listener)) throw Error('Metro listener ownership is uncertain.');
    return 'OWNED_METRO';
  }
  if (!portFree) throw Error('Metro port is occupied without a managed ownership record.');
  return 'EMPTY_PORT';
}

function statFields(stat) {
  const end = stat.lastIndexOf(')');
  if (end < 0) throw Error('Invalid Linux process stat.');
  const fields = stat.slice(end + 1).trim().split(/\s+/);
  return { group: Number(fields[2]), session: Number(fields[3]), startTicks: fields[19] };
}

function processIdentity(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 1) return null;
  try {
    return {
      ...statFields(readFileSync(`/proc/${pid}/stat`, 'utf8')),
      cwd: resolve(readlinkSync(`/proc/${pid}/cwd`)),
      command: readFileSync(`/proc/${pid}/cmdline`, 'utf8').replaceAll('\0', ' ').trim(),
    };
  } catch { return null; }
}

export function listenerState(inodes, ownedInodes) {
  if (inodes.size === 0) return 'EMPTY';
  if (inodes.size === 1 && ownedInodes.has([...inodes][0])) return 'OWNED';
  return 'FOREIGN';
}

function listeners() {
  const inodes = new Set();
  for (const name of ['tcp', 'tcp6']) {
    const rows = readFileSync(`/proc/net/${name}`, 'utf8').trim().split('\n').slice(1);
    for (const row of rows) {
      const fields = row.trim().split(/\s+/);
      if (fields[1]?.endsWith(':1F91') && fields[3] === '0A') {
        if (!/^[1-9][0-9]*$/.test(fields[9])) throw Error('Unverifiable Metro listener.');
        inodes.add(fields[9]);
      }
    }
  }
  return inodes;
}

export function managedListener(record, projectRoot = root) {
  const { pid, startTicks } = record;
  const leader = processIdentity(pid);
  if (!leader || leader.group !== pid || leader.session !== pid ||
      leader.startTicks !== startTicks || leader.cwd !== projectRoot) {
    throw Error('Managed Metro group identity changed.');
  }
  const inodes = listeners();
  const owned = new Set();
  if (inodes.size) {
    for (const entry of readdirSync('/proc')) {
      if (!/^[1-9][0-9]*$/.test(entry)) continue;
      const dir = `/proc/${entry}`;
      try {
        const before = statFields(readFileSync(`${dir}/stat`, 'utf8'));
        if (before.group !== pid || before.session !== pid) continue;
        const sockets = [];
        for (const fd of readdirSync(`${dir}/fd`)) {
          try {
            const match = /^socket:\[([0-9]+)\]$/.exec(readlinkSync(`${dir}/fd/${fd}`));
            if (match) sockets.push(match[1]);
          } catch (error) {
            if (error.code !== 'ENOENT') throw error;
          }
        }
        const after = statFields(readFileSync(`${dir}/stat`, 'utf8'));
        if (after.group === pid && after.session === pid && after.startTicks === before.startTicks) {
          for (const inode of sockets) owned.add(inode);
        }
      } catch (error) {
        if (!['ENOENT', 'ESRCH', 'EACCES'].includes(error.code)) throw error;
      }
    }
  }
  const current = listeners();
  if (current.size !== inodes.size || [...current].some((inode) => !inodes.has(inode)) ||
      processIdentity(pid)?.startTicks !== startTicks) {
    throw Error('Metro listener changed during ownership verification.');
  }
  return listenerState(current, owned);
}

async function freePort() {
  return new Promise((done, fail) => {
    const server = createServer();
    server.once('error', (error) => error.code === 'EADDRINUSE' ? done(false) : fail(error));
    server.listen(8081, '127.0.0.1', () => server.close((error) => error ? fail(error) : done(true)));
  });
}

function previewRecord() {
  if (process.platform !== 'linux') throw Error('Linux Codespace required.');
  let present = false;
  let record;
  try {
    const stat = lstatSync(recordPath);
    present = true;
    if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid() ||
        (stat.mode & 0o077) !== 0) throw Error('Unsafe managed Metro record.');
    record = JSON.parse(readFileSync(recordPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return { present, record };
}

export function requirePreviewListener() {
  const { present, record } = previewRecord();
  if (!present || !ownedMetro(record, processIdentity(record?.pid)) ||
      managedListener(record) !== 'OWNED') throw Error('Metro listener ownership is uncertain.');
}

async function main() {
  const { present, record } = previewRecord();
  const proc = present ? processIdentity(record?.pid) : null;
  if (present && !ownedMetro(record, proc)) throw Error('Managed Metro ownership is uncertain.');
  const listener = present ? managedListener(record) : 'EMPTY';
  const portFree = !present && await freePort() && listeners().size === 0;
  console.log(preflightDecision(present, record, proc, portFree, listener));
}

if (process.argv[1] === '-' && !import.meta.url.startsWith('data:')) {
  main().catch((error) => { console.error(`Trusted preview preflight: ${error.message}`); process.exitCode = 1; });
}
