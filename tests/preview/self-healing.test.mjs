import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  classifyRecord, listenerState, processStat, readManagedRecord, retryOwnership,
} from '../../.github/scripts/preflight-pr-codespaces-preview.mjs';
import {
  checkedManagedRecord, checkStartupIdentity, previewAction, requireStartupIdentity,
  retryStartup, signalMetroGroup, stopOwnedMetro, withStartupLock,
} from '../../scripts/start-codespace-expo.mjs';

const record = { pid: 81, startTicks: '1234', port: 8083 };
const leader = {
  ...record, state: 'S', group: 81, session: 81, uid: 1000, cwd: '/workspaces/Tio-Money',
  command: 'npm run mobile',
};
const group = new Map([[81, '1234'], [82, '1235']]);

test('only a dead record with a clear process group and port is stale', () => {
  const classify = (proc, members, listener) =>
    classifyRecord(record, proc, members, listener, leader.cwd, leader.uid);
  const empty = new Map();
  assert.equal(classify(leader, group, 'OWNED'), 'OWNED_METRO');
  assert.equal(classify(null, empty, 'EMPTY'), 'STALE_RECORD');
  assert.throws(() => classify({ ...leader, state: 'Z' }, empty, 'EMPTY'), /PID_PRESENT/);
  assert.throws(() => classify(null, group, 'EMPTY'), /STALE_STATE_OCCUPIED/);
  assert.throws(() => classify(null, empty, 'FOREIGN'), /STALE_STATE_OCCUPIED/);
  assert.throws(() => classify({ ...leader, startTicks: '6000' }, empty, 'EMPTY'), /PID_REUSED/);
  assert.throws(() => classify({ ...leader, command: 'npm run mobile-other' }, group, 'EMPTY'), /OWNERSHIP_UNKNOWN/);
  assert.throws(() => classify({ ...leader, session: 83 }, group, 'EMPTY'), /OWNERSHIP_UNKNOWN/);
  assert.throws(() => classify({ ...leader, uid: 1001 }, group, 'EMPTY'), /OWNERSHIP_UNKNOWN/);
  assert.throws(() => classify(leader, group, 'FOREIGN'), /FOREIGN_LISTENER/);
  assert.equal(listenerState(new Set(['1', '2']), new Set(['1'])), 'FOREIGN');
});

test('ownership resamples transient reads only and stops after the bound', async () => {
  const transient = Object.assign(new Error('changed'), { code: 'OWNERSHIP_RACE' });
  let reads = 0;
  const pause = async () => {};
  assert.equal(await retryOwnership(() => {
    reads += 1;
    if (reads < 3) throw transient;
    return 'owned';
  }, { pause }), 'owned');
  reads = 0;
  await assert.rejects(retryOwnership(() => { reads += 1; throw transient; }, { attempts: 4, pause }), transient);
  assert.equal(reads, 4);
  reads = 0;
  await assert.rejects(retryOwnership(() => { reads += 1; throw Error('unknown'); }, { pause }), /unknown/);
  assert.equal(reads, 1);
});

test('async transient ownership races back off within a fixed budget; stable foreign listeners do not retry', async () => {
  const delays = [];
  const pause = async (ms) => { delays.push(ms); };
  const transient = Object.assign(Error('listener set changed'), { code: 'OWNERSHIP_RACE' });
  await assert.rejects(retryOwnership(async () => { throw transient; }, { pause }), transient);
  assert.deepEqual(delays, [100, 200, 400, 500]);
  delays.length = 0;
  for (const [proc, listener, error] of [
    [leader, 'FOREIGN', /FOREIGN_LISTENER/],
    [{ ...leader, startTicks: '1235' }, 'EMPTY', /PID_REUSED/],
    [{ ...leader, uid: 1001 }, 'EMPTY', /OWNERSHIP_UNKNOWN/],
  ]) {
    await assert.rejects(retryOwnership(() => classifyRecord(record, proc, group, listener, leader.cwd, leader.uid),
      { pause }), error);
  }
  assert.deepEqual(delays, []);
});

test('startup rejects PID reuse after a successful poll and checks all identity fields before record creation', () => {
  const candidate = { ...leader, uid: process.getuid(), cwd: resolve(fileURLToPath(new URL('../..', import.meta.url))) };
  assert.equal(checkStartupIdentity(record.pid, record.startTicks, candidate), true);
  requireStartupIdentity(record.pid, record.startTicks, () => candidate);
  for (const mismatch of [{ pid: 82 }, { startTicks: '999' }, { uid: candidate.uid + 1 },
    { group: 82 }, { session: 82 }, { cwd: '/other' }, { command: 'npm run dev' }]) {
    assert.throws(() => requireStartupIdentity(record.pid, record.startTicks, () => ({ ...candidate, ...mismatch })),
      /PID_REUSED|START_IDENTITY_UNKNOWN/);
  }
  assert.throws(() => requireStartupIdentity(record.pid, record.startTicks, () => null), /START_IDENTITY_UNKNOWN/);
  const starter = readFileSync(new URL('../../scripts/start-codespace-expo.mjs', import.meta.url), 'utf8');
  assert.match(starter, /requireStartupIdentity\(child\.pid, started\.startTicks\);\n\s+writeFileSync\(pending,/);
});

function shutdownFixture({ afterTerm = group, afterKill = new Map(), listener = 'OWNED',
  forceAfterTimeout = true, verificationError, signalError } = {}) {
  const events = [];
  let remaining = group;
  let time = 0;
  let verification = 0;
  const control = () => stopOwnedMetro(record, {
    verify: async () => {
      verification += 1;
      if (verificationError) throw verificationError;
      return { state: 'OWNED_METRO', group: remaining };
    },
    readGroup: () => remaining,
    readListener: () => listener,
    send: (_pid, targets, signal) => {
      events.push({ signal, targets: [...targets.keys()], time });
      if (signalError) throw signalError;
      remaining = signal === 'SIGTERM' ? afterTerm : afterKill;
    },
    ensureFree: async (port) => { events.push({ port }); },
    forceAfterTimeout,
    pause: async (ms) => { time += ms; },
    now: () => time,
    log: () => {},
  });
  return { control, events, verifications: () => verification };
}

test('graceful stop waits for the whole group and rechecks the selected port', async () => {
  const { control, events } = shutdownFixture({ afterTerm: new Map() });
  await control();
  assert.deepEqual(events, [{ signal: 'SIGTERM', targets: [81, 82], time: 0 }, { port: 8083 }]);
});

test('KILL requires a TERM timeout and a fresh verified identity', async () => {
  const { control, events, verifications } = shutdownFixture();
  await control();
  assert.deepEqual(events, [
    { signal: 'SIGTERM', targets: [81, 82], time: 0 },
    { signal: 'SIGKILL', targets: [81, 82], time: 10_000 },
    { port: 8083 },
  ]);
  assert.equal(verifications(), 2);
});

test('after leader exit only original verified survivors can be escalated', async () => {
  const { control, events } = shutdownFixture({ afterTerm: new Map([[82, '1235']]) });
  await control();
  assert.deepEqual(events[1], { signal: 'SIGKILL', targets: [82], time: 10_000 });
  for (const afterTerm of [new Map([[82, '9999']]), new Map([[83, '1236']])]) {
    const unknown = shutdownFixture({ afterTerm });
    await assert.rejects(unknown.control(), /GROUP_UNKNOWN/);
    assert.deepEqual(unknown.events.map(({ signal }) => signal), ['SIGTERM']);
  }
});

test('failed or unsafe termination cannot advance to replacement', async () => {
  for (const [settings, error, signals] of [
    [{ verificationError: Error('OWNERSHIP_UNKNOWN') }, /OWNERSHIP_UNKNOWN/, []],
    [{ signalError: Error('SIGNAL_FAILED') }, /SIGNAL_FAILED/, ['SIGTERM']],
    [{ afterTerm: new Map([[81, 'reused']]) }, /PID_REUSED/, ['SIGTERM']],
    [{ listener: 'FOREIGN' }, /FOREIGN_LISTENER/, ['SIGTERM']],
    [{ forceAfterTimeout: false }, /STOP_TIMEOUT/, ['SIGTERM']],
    [{ afterKill: group }, /STOP_TIMEOUT/, ['SIGTERM', 'SIGKILL']],
  ]) {
    const { control, events } = shutdownFixture(settings);
    await assert.rejects(control(), error);
    assert.deepEqual(events.map(({ signal }) => signal), signals);
  }
});

test('manual startup retries a cleaned transient failure once and preserves terminal reason', async () => {
  const timeout = { reason: 'START_TIMEOUT', category: 'NETWORK' };
  const exits = [timeout, null];
  const messages = [];
  await retryStartup(async () => exits.shift(), true, async () => {}, (line) => messages.push(line));
  assert.deepEqual(exits, []);
  assert.match(messages[0], /METRO_START_RETRY.*START_TIMEOUT/);
  let attempts = 0;
  await assert.rejects(retryStartup(async () => { attempts += 1; return timeout; },
    true, async () => {}, () => {}), /START_TIMEOUT.*second attempt/);
  assert.equal(attempts, 2);
  for (const [manual, category] of [[false, 'NETWORK'], [true, 'PORT_CONFLICT'], [true, 'EXPO_AUTH']]) {
    attempts = 0;
    await assert.rejects(retryStartup(async () => {
      attempts += 1;
      return { reason: 'START_EXITED', category };
    }, manual, async () => {}, () => {}), /START_EXITED/);
    assert.equal(attempts, 1);
  }
  attempts = 0;
  await assert.rejects(retryStartup(async () => {
    attempts += 1;
    throw Error('STOP_TIMEOUT');
  }, true), /STOP_TIMEOUT/);
  assert.equal(attempts, 1);
});

test('symlink, malformed PID record and records using unsupported ports fail closed', { skip: process.platform !== 'linux' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'tio-record-'));
  try {
    const path = join(dir, 'metro.json');
    assert.equal(readManagedRecord(path), null);
    writeFileSync(path, JSON.stringify(record), { mode: 0o600 });
    assert.deepEqual(readManagedRecord(path), record);
    const alias = join(dir, 'alias.json');
    symlinkSync(path, alias);
    assert.throws(() => readManagedRecord(alias), /RECORD_UNSAFE/);
    writeFileSync(path, '{');
    assert.throws(() => readManagedRecord(path), /RECORD_INVALID/);
    writeFileSync(path, JSON.stringify({ ...record, port: 8086 }));
    assert.throws(() => readManagedRecord(path), /RECORD_INVALID/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('concurrent lifecycle runs serialize, including after a stale legacy lock', { skip: process.platform !== 'linux' }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tio-lock-'));
  const marker = join(dir, 'startup.lock');
  writeFileSync(marker, '2147483647', { mode: 0o600 });
  const earlier = new Date(Date.now() - 10_000);
  utimesSync(marker, earlier, earlier);
  try {
    let release;
    let entered;
    const held = new Promise((done) => { entered = done; });
    const finish = new Promise((done) => { release = done; });
    const first = withStartupLock(dir, async () => { entered(); await finish; });
    await Promise.race([held, first]);
    try {
      await assert.rejects(withStartupLock(dir, () => assert.fail('concurrent writer entered'), 0.1), /LOCK_TIMEOUT/);
    } finally {
      release();
      await first;
    }
    assert.equal(await withStartupLock(dir, () => 'next'), 'next');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('stale-record cleanup refuses replaced records, occupied ports and reused PIDs', { skip: process.platform !== 'linux' }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tio-stale-record-'));
  const path = join(dir, 'metro.json');
  const stale = { ...record, pid: 2147483647 };
  const saved = JSON.stringify(stale);
  const write = (value, file = path) => writeFileSync(file, value, { mode: 0o600 });
  try {
    await withStartupLock(dir, async () => {
      write(saved);
      await assert.rejects(checkedManagedRecord(false, path), /STALE_RECORD/);
      await assert.rejects(checkedManagedRecord(true, path, async () => {
        const replacement = join(dir, 'replacement');
        write(saved, replacement);
        renameSync(replacement, path);
      }), /RECORD_CHANGED/);
      assert.equal(readFileSync(path, 'utf8'), saved, 'replacement with identical bytes must survive');
      await assert.rejects(checkedManagedRecord(true, path, async () => {
        write(JSON.stringify({ ...stale, port: 8084 }));
      }), /RECORD_CHANGED/);
      assert.equal(readManagedRecord(path).port, 8084);
      await assert.rejects(checkedManagedRecord(true, path, async () => {
        throw Error('PORT_OCCUPIED');
      }), /PORT_OCCUPIED/);
      assert.equal(readManagedRecord(path).port, 8084);
      const reused = { ...stale, pid: process.pid, bootId: '00000000-0000-0000-0000-000000000000' };
      write(JSON.stringify(reused));
      await assert.rejects(checkedManagedRecord(true, path, () => assert.fail('unverified PID cannot reach cleanup')), /PID_REUSED/);
      assert.deepEqual(readManagedRecord(path), reused);
    });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('manual recovery and a simultaneous push share the lock, then the push reuses healthy Metro', { skip: process.platform !== 'linux' }, async () => {
  const workflow = readFileSync(new URL('../../.github/workflows/tio-money-eas-pr-preview.yml', import.meta.url), 'utf8');
  assert.match(workflow, /\(github.event_name == 'workflow_run' \|\| inputs.operation == 'codespaces_live'\) && 'tio-money-codespaces-pr-preview'/);
  assert.match(workflow, /cancel-in-progress: false/);
  const dir = mkdtempSync(join(tmpdir(), 'tio-manual-push-'));
  const path = join(dir, 'metro.json');
  writeFileSync(path, JSON.stringify({ ...record, pid: 2147483647 }), { mode: 0o600 });
  const events = [];
  let announceCleanup;
  let finishManual;
  const checking = new Promise((done) => { announceCleanup = done; });
  const manualMayFinish = new Promise((done) => { finishManual = done; });
  let managed;
  try {
    const manual = withStartupLock(dir, async () => {
      await checkedManagedRecord(true, path, async () => {
        events.push('manual-checks-port');
        announceCleanup();
        await manualMayFinish;
      });
      managed = record;
      events.push('manual-started-metro');
    });
    await Promise.race([checking, manual]);
    await assert.rejects(withStartupLock(dir, () => assert.fail('push entered during manual cleanup'), 0.1), /LOCK_TIMEOUT/);
    const push = withStartupLock(dir, async () => {
      assert.equal(previewAction(managed, true, true), 'reuse');
      events.push('push-reused-metro');
    });
    finishManual();
    await Promise.all([manual, push]);
    assert.deepEqual(events, ['manual-checks-port', 'manual-started-metro', 'push-reused-metro']);
  } finally {
    finishManual();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('pidfd rejects mismatched process start time before signaling the real fixture', { skip: process.platform !== 'linux' }, async () => {
  const fixture = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { detached: true });
  const stopped = once(fixture, 'exit');
  try {
    await once(fixture, 'spawn');
    const ticks = processStat(fixture.pid).startTicks;
    assert.throws(() => signalMetroGroup(fixture.pid, new Map([[fixture.pid, ticks + '0']]), 'SIGTERM'), /SIGNAL_IDENTITY_CHANGED/);
    assert.equal(fixture.signalCode, null);
    signalMetroGroup(fixture.pid, new Map([[fixture.pid, ticks]]), 'SIGTERM');
    assert.deepEqual(await stopped, [null, 'SIGTERM']);
  } finally {
    if (fixture.exitCode === null && fixture.signalCode === null) fixture.kill();
    await stopped;
  }
});
