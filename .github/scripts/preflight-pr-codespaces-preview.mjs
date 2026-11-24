// Stream this trusted-main code over Codespaces SSH. It never loads a PR script.
import { closeSync, constants, fstatSync, openSync, readFileSync, readlinkSync, lstatSync, readdirSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:net';

const root = '/workspaces/Tio-Money';
const recordPath = join(homedir(), '.cache', 'tio-money-expo-preview', 'metro.json');

export function isMobileCommand(command) {
  return /(?:^|[\s/])npm(?:-cli)?(?:\.js)?\s+run\s+mobile(?:\s|$)/.test(command);
}

export function ownedMetro(record, proc, projectRoot = root) {
  return Number.isSafeInteger(record?.pid) && record.pid > 1
    && typeof record.startTicks === 'string' && /^[0-9]+$/.test(record.startTicks)
    && record.startTicks === proc?.startTicks
    && proc.cwd === projectRoot && isMobileCommand(proc.command);
}

export function preflightDecision(recordPresent, record, proc, portFree, listener = 'EMPTY', manual = false) {
  if (recordPresent) {
    if (!ownedMetro(record, proc)) throw Error('Managed Metro ownership is uncertain.');
    if (!['EMPTY', 'OWNED'].includes(listener)) throw Error('Metro listener ownership is uncertain.');
    return 'OWNED_METRO';
  }
  if (!portFree) {
    if (manual) return 'FOREIGN_PORT';
    throw Error('Metro port is occupied without a managed ownership record.');
  }
  return 'EMPTY_PORT';
}

function statFields(stat) {
  const end = stat.lastIndexOf(')');
  if (end < 0) throw Error('Invalid Linux process stat.');
  const fields = stat.slice(end + 1).trim().split(/\s+/);
  return { state: fields[0], group: Number(fields[2]), session: Number(fields[3]), startTicks: fields[19] };
}

const gone = (error) => ['ENOENT', 'ESRCH'].includes(error.code);
const live = (proc) => proc && !['Z', 'X'].includes(proc.state);
const race = () => Object.assign(Error('OWNERSHIP_RACE: Metro identity or listener changed while being checked.'), { code: 'OWNERSHIP_RACE' });

export function processStat(pid) {
  try {
    return statFields(readFileSync(`/proc/${pid}/stat`, 'utf8'));
  } catch (error) {
    if (gone(error)) return null;
    throw Error('PROCESS_UNREADABLE: Cannot inspect Linux process identity.');
  }
}

function processIdentity(pid) {
  const before = processStat(pid);
  if (!live(before)) return null;
  try {
    const proc = {
      ...before,
      cwd: resolve(readlinkSync(`/proc/${pid}/cwd`)),
      command: readFileSync(`/proc/${pid}/cmdline`, 'utf8').replaceAll('\0', ' ').trim(),
      uid: lstatSync(`/proc/${pid}`).uid,
    };
    const after = processStat(pid);
    if (!live(after) || after.startTicks !== before.startTicks) throw race();
    return proc;
  } catch (error) {
    if (gone(error)) throw race();
    if (error.code === 'OWNERSHIP_RACE') throw error;
    throw Error('PROCESS_UNREADABLE: Cannot inspect managed Metro command, directory or user.');
  }
}

export function metroGroup(pid) {
  const group = new Map();
  for (const entry of readdirSync('/proc')) {
    if (!/^[1-9][0-9]*$/.test(entry)) continue;
    const proc = processStat(entry);
    if (live(proc) && proc.group === pid && proc.session === pid) group.set(Number(entry), proc.startTicks);
  }
  return group;
}

export async function retryOwnership(check, { attempts = 5, pause = wait } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try { return check(); }
    catch (error) {
      if (error.code !== 'OWNERSHIP_RACE' || attempt >= attempts) throw error;
      await pause(200);
    }
  }
}

export function listenerState(inodes, ownedInodes) {
  if (inodes.size === 0) return 'EMPTY';
  if (inodes.size === 1 && ownedInodes.has([...inodes][0])) return 'OWNED';
  return 'FOREIGN';
}

export function listeners(port = 8081) {
  if (!Number.isSafeInteger(port) || port < 8081 || port > 8085) throw Error('Unsupported Metro port.');
  const suffix = ':' + port.toString(16).toUpperCase().padStart(4, '0');
  const inodes = new Set();
  for (const name of ['tcp', 'tcp6']) {
    const rows = readFileSync(`/proc/net/${name}`, 'utf8').trim().split('\n').slice(1);
    for (const row of rows) {
      const fields = row.trim().split(/\s+/);
      if (fields[1]?.endsWith(suffix) && fields[3] === '0A') {
        if (!/^[1-9][0-9]*$/.test(fields[9])) throw Error('Unverifiable Metro listener.');
        inodes.add(fields[9]);
      }
    }
  }
  return inodes;
}

export function groupListener(port, group, groupId) {
  const before = listeners(port);
  const owned = new Set();
  if (before.size) {
    for (const [pid, ticks] of group) {
      const dir = `/proc/${pid}`;
      try {
        const sockets = [];
        for (const fd of readdirSync(`${dir}/fd`)) {
          try {
            const match = /^socket:\[([0-9]+)\]$/.exec(readlinkSync(`${dir}/fd/${fd}`));
            if (match) sockets.push(match[1]);
          } catch (error) {
            if (!gone(error)) throw error;
          }
        }
        const after = processStat(pid);
        if (live(after) && after.startTicks === ticks && after.group === groupId && after.session === groupId) {
          for (const inode of sockets) owned.add(inode);
        }
      } catch (error) {
        if (!gone(error)) throw Error('LISTENER_UNREADABLE: Cannot inspect a managed Metro socket.');
      }
    }
  }
  const current = listeners(port);
  if (current.size !== before.size || [...current].some((inode) => !before.has(inode))) throw race();
  return listenerState(current, owned);
}

export function classifyRecord(record, leader, group, listener, projectRoot = root, uid = process.getuid()) {
  if (leader && leader.startTicks !== record.startTicks) {
    throw Error('PID_REUSED: Managed Metro PID now identifies another process. Inspect the private preview state.');
  }
  if (!leader) {
    if (group.size || listener !== 'EMPTY') {
      throw Error('STALE_STATE_OCCUPIED: Managed Metro leader is gone but its group or port remains occupied. Inspect the dedicated Codespace.');
    }
    return 'STALE_RECORD';
  }
  if (!live(leader)) throw Error('PID_PRESENT: Managed Metro PID has not exited from the process table.');
  if (!ownedMetro(record, leader, projectRoot) || leader.group !== record.pid ||
      leader.session !== record.pid || leader.uid !== uid) {
    throw Error('OWNERSHIP_UNKNOWN: Managed Metro command, user, directory or session could not be verified.');
  }
  if (listener === 'FOREIGN') {
    // A socket can appear between /proc reads. Allow bounded re-observation, never control it.
    throw Object.assign(Error('FOREIGN_LISTENER: Metro port ownership could not be verified. Inspect the port in the dedicated Codespace.'), { code: 'OWNERSHIP_RACE' });
  }
  return 'OWNED_METRO';
}

export function inspectManagedMetro(record, projectRoot = root) {
  const stat = processStat(record.pid);
  if (stat && record.bootId && record.bootId !== currentBootId()) {
    throw Error('PID_REUSED: Previous-boot Metro PID is present in the current process table.');
  }
  const leader = live(stat) ? processIdentity(record.pid) : stat;
  const group = metroGroup(record.pid);
  if (live(leader) && leader.group === record.pid && leader.session === record.pid &&
      group.get(record.pid) !== leader.startTicks) throw race();
  const port = record.port ?? 8081;
  const listener = groupListener(port, group, record.pid);
  const after = processStat(record.pid);
  if (after?.startTicks !== stat?.startTicks || Boolean(live(after)) !== Boolean(live(stat))) throw race();
  return { state: classifyRecord(record, leader, group, listener, projectRoot), listener, group };
}

export function managedListener(record, projectRoot = root) {
  const current = inspectManagedMetro(record, projectRoot);
  if (current.state !== 'OWNED_METRO') throw Error('METRO_EXITED: Managed Metro exited before listener verification.');
  return current.listener;
}

export function currentBootId() {
  return readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim();
}

async function freePort(port = 8081) {
  return new Promise((done, fail) => {
    const server = createServer();
    server.once('error', (error) => error.code === 'EADDRINUSE' ? done(false) : fail(error));
    server.listen(port, '127.0.0.1', () => server.close((error) => error ? fail(error) : done(true)));
  });
}

function recordStamp(stat) {
  return [stat.dev, stat.ino, stat.size, stat.uid, stat.mode, stat.mtimeNs, stat.ctimeNs].join(':');
}

export function readManagedRecordSnapshot(recordPath) {
  if (process.platform !== 'linux') throw Error('Linux Codespace required.');
  try {
    const initial = lstatSync(recordPath, { bigint: true, throwIfNoEntry: false });
    if (!initial) return null;
    if (!initial.isFile()) throw Error('RECORD_UNSAFE: Managed Metro record must be a private regular file.');
    const fd = openSync(recordPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const stat = fstatSync(fd, { bigint: true });
      if (!stat.isFile() || stat.uid !== BigInt(process.getuid()) || (stat.mode & 0o077n) !== 0n ||
          stat.size > 4096n) {
        throw Error('RECORD_UNSAFE: Managed Metro record must be a private regular file.');
      }
      const stamp = recordStamp(stat);
      const raw = readFileSync(fd, 'utf8');
      if (recordStamp(initial) !== stamp ||
          recordStamp(lstatSync(recordPath, { bigint: true })) !== stamp) {
        throw Error('RECORD_CHANGED: Managed Metro record changed while being read.');
      }
      const record = JSON.parse(raw);
      const port = record?.port ?? 8081;
      if (!Number.isSafeInteger(record?.pid) || record.pid <= 1 || !/^[0-9]+$/.test(record.startTicks) ||
          typeof record.startTicks !== 'string' || !Number.isSafeInteger(port) || port < 8081 || port > 8085 ||
          (record.bootId !== undefined && !/^[0-9a-f-]{36}$/.test(record.bootId))) {
        throw Error('RECORD_INVALID: Managed Metro record has an unsupported PID, identity or port.');
      }
      return { record, stamp, raw };
    } finally { closeSync(fd); }
  } catch (error) {
    if (error.code === 'ENOENT') throw Error('RECORD_CHANGED: Managed Metro record disappeared while being read.');
    if (error instanceof SyntaxError) throw Error('RECORD_INVALID: Managed Metro record is malformed. Inspect the private preview state.');
    if (error.code) throw Error('RECORD_UNREADABLE: Cannot read the private managed Metro record.');
    throw error;
  }
}

export function readManagedRecord(recordPath) {
  return readManagedRecordSnapshot(recordPath)?.record ?? null;
}

export async function requirePreviewListener(expected) {
  const record = readManagedRecord(recordPath);
  if (!record || await retryOwnership(() => managedListener(record)) !== 'OWNED') {
    throw Error('Metro listener ownership is uncertain.');
  }
  const { pid, startTicks, bootId, port = 8081 } = record;
  if (expected && (expected.pid !== pid || expected.startTicks !== startTicks ||
      expected.bootId !== bootId || expected.port !== port)) {
    throw Error('Managed Metro instance changed during source verification.');
  }
  return { pid, startTicks, bootId, port };
}

async function main() {
  const manual = process.argv.includes('--manual');
  const record = readManagedRecord(recordPath);
  if (!record) {
    const portFree = await freePort() && listeners().size === 0;
    console.log(preflightDecision(false, null, null, portFree, 'EMPTY', manual));
    return;
  }
  const { state } = await retryOwnership(() => inspectManagedMetro(record));
  if (state === 'STALE_RECORD' && !manual) {
    throw Error('STALE_RECORD: Run Live Expo Go Preview manually to recover the exited managed Metro.');
  }
  console.log(state);
}

if (process.argv[1] === '-' && !import.meta.url.startsWith('data:')) {
  main().catch((error) => { console.error(`Trusted preview preflight: ${error.message}`); process.exitCode = 1; });
}
