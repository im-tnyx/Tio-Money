// Stream this trusted-main code over Codespaces SSH. It never loads a PR script.
import { readFileSync, readlinkSync, lstatSync } from 'node:fs';
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

export function preflightDecision(recordPresent, record, proc, portFree) {
  if (recordPresent) {
    if (!ownedMetro(record, proc)) throw Error('Managed Metro ownership is uncertain.');
    return 'OWNED_METRO';
  }
  if (!portFree) throw Error('Metro port is occupied without a managed ownership record.');
  return 'EMPTY_PORT';
}

function processIdentity(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const end = stat.lastIndexOf(')');
    if (end < 0) return null;
    return {
      startTicks: stat.slice(end + 1).trim().split(/\s+/)[19],
      cwd: resolve(readlinkSync(`/proc/${pid}/cwd`)),
      command: readFileSync(`/proc/${pid}/cmdline`, 'utf8').replaceAll('\0', ' ').trim(),
    };
  } catch { return null; }
}

async function freePort() {
  return new Promise((done, fail) => {
    const server = createServer();
    server.once('error', (error) => error.code === 'EADDRINUSE' ? done(false) : fail(error));
    server.listen(8081, '127.0.0.1', () => server.close((error) => error ? fail(error) : done(true)));
  });
}

async function main() {
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
  const proc = present ? processIdentity(record?.pid) : null;
  console.log(preflightDecision(present, record, proc, present ? false : await freePort()));
}

if (process.argv[1] === '-') {
  main().catch((error) => { console.error(`Trusted preview preflight: ${error.message}`); process.exitCode = 1; });
}
