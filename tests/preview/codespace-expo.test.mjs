import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { test } from 'node:test';
import {
  isMobileCommand, metroChildEnvironment, metroReady, parseStartTicks, recordMatches, previewAction,
  tunnelReady, validExpoGoTunnel, validWhoami,
} from '../../scripts/start-codespace-expo.mjs';

async function withServer(handler, check) {
  const server = createServer(handler);
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  try { await check(server.address().port); }
  finally { await new Promise((ok) => server.close(ok)); }
}

test('interactive Metro child process always receives a valid CI boolean string', () => {
  const parent = { CI: '', NODE_ENV: 'development' };
  const child = metroChildEnvironment(parent);
  assert.equal(child.CI, 'false');
  assert.equal(child.EXPO_NO_TELEMETRY, '1');
  assert.equal(child.NODE_ENV, 'development');
  assert.equal(parent.CI, '', 'parent process environment must not be mutated');
  assert.equal(metroChildEnvironment({ CI: 'true' }).CI, 'false',
    'Codespaces preview must remain interactive even if inherited CI is true');
});

test('validates Expo Go tunnel instead of trusting an arbitrary deep link', () => {
  assert.equal(validExpoGoTunnel('exp://tunnel.on.expo.app'), true);
  assert.equal(validExpoGoTunnel('exps://abc.exp.direct/path'), true);
  for (const link of ['http://tunnel.on.expo.app', 'exp://127.0.0.1:8081',
    'exp://on.expo.app.evil.example', 'exp://untrusted.example',
    'exp://user:password@tunnel.on.expo.app', null]) {
    assert.equal(validExpoGoTunnel(link), false);
  }
});

test('only the existing Tio Money owner account can start a signed Expo tunnel', () => {
  assert.equal(validWhoami({ status: 0, stdout: 'tnyx-23\n' }), true);
  assert.equal(validWhoami({ status: 0, stdout: 'tnyx-23\n' }, 'tnyx-23'), true);
  assert.equal(validWhoami({ status: 0, stdout: 'tnyx' }), false);
  assert.equal(validWhoami({ status: 0, stdout: 'another-account' }), false);
  assert.equal(validWhoami({ status: 0, stdout: 'Not logged in\n' }), false);
  assert.equal(validWhoami({ status: 1, stdout: 'tnyx-23' }), false);
  assert.equal(validWhoami({ status: null, error: new Error('timeout') }), false);
});

test('PID reuse, foreign cwd and unrelated Metro command are rejected', () => {
  const rec = { pid: 200, startTicks: '9001' };
  const proc = { startTicks: '9001', cwd: '/workspaces/Tio-Money', command: 'npm run mobile' };
  assert.equal(recordMatches(rec, proc, '/workspaces/Tio-Money'), true);
  assert.equal(recordMatches(rec, { ...proc, startTicks: '9002' }, '/workspaces/Tio-Money'), false);
  assert.equal(recordMatches(rec, { ...proc, cwd: '/wrong' }, '/workspaces/Tio-Money'), false);
  assert.equal(recordMatches(rec, { ...proc, command: 'npm run dev' }, '/workspaces/Tio-Money'), false);
  assert.equal(isMobileCommand('node /usr/local/bin/npm run mobile'), true);
  // Real Node 22 npm executable resolves to npm-cli.js in /proc/<pid>/cmdline.
  assert.equal(isMobileCommand('node /opt/nvm/versions/node/v22.16.0/lib/node_modules/npm/bin/npm-cli.js run mobile'), true);
  assert.equal(isMobileCommand('npm-cli.js run mobile -- --tunnel'), true);
  assert.equal(isMobileCommand('node /tmp/npm-cli.js run mobile-other'), false);
  assert.equal(isMobileCommand('npm run mobile-other'), false);
});

test('managed process stays unchanged on healthy refresh and recovery requires ownership', () => {
  const record = { pid: 1201, startTicks: '9001' };
  assert.equal(previewAction(record, true, true), 'reuse');
  assert.deepEqual(record, { pid: 1201, startTicks: '9001' });
  assert.equal(previewAction(record, true, false), 'recover');
  assert.equal(previewAction(record, false, true), 'recover');
  assert.equal(previewAction(null, false, false), 'start');
  const starter = readFileSync(new URL('../../scripts/start-codespace-expo.mjs', import.meta.url), 'utf8');
  assert.match(starter, /lstatSync\(PID_FILE\)/);
  assert.match(starter, /constants\.O_RDONLY \| constants\.O_NOFOLLOW/);
  assert.match(starter, /verifyListener\(record\)/);
  assert.match(starter, /await stopManaged\(\);/);
  assert.match(starter, /if \(action === 'reuse'\)/);
  assert.match(starter, /if \(action === 'recover'\)/);
});

test('Linux /proc start tick parser handles malformed input', () => {
  assert.equal(parseStartTicks('invalid'), null);
  assert.equal(parseStartTicks('1 (npm run mobile) S ' +
    Array.from({ length: 19 }, (_, i) => String(i + 1)).join(' ')), '19');
});

test('Metro requires its exact status marker', async () => {
  await withServer((req, res) => res.end(req.url === '/status'
    ? 'packager-status:running' : ''), async (port) => assert.equal(await metroReady(port), true));
  await withServer((_req, res) => res.end('not Metro'),
    async (port) => assert.equal(await metroReady(port), false));
});

test('Expo deep-link endpoint rejects wrong or unavailable tunnel', async () => {
  await withServer((_req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ url: 'exps://test.on.expo.app' }));
  }, async (port) => assert.equal(await tunnelReady(port), true));
  await withServer((_req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ url: 'exp://127.0.0.1:8081' }));
  }, async (port) => assert.equal(await tunnelReady(port), false));
  await withServer((_req, res) => { res.statusCode = 503; res.end('offline'); },
    async (port) => assert.equal(await tunnelReady(port), false));
});

test('closed port is not Metro or tunnel-ready', async () => {
  assert.equal(await metroReady(1), false);
  assert.equal(await tunnelReady(1), false);
});


test('Expo public identity points only to existing tnyx-23/tio-money slug', () => {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const expo = JSON.parse(readFileSync(join(projectRoot, 'app.json'), 'utf8')).expo;
  assert.equal(expo.name, 'Tio Money');
  assert.equal(expo.slug, 'tio-money');
  assert.equal(expo.owner, 'tnyx-23');
  assert.equal(expo.extra?.eas?.projectId, '722e6857-1159-4414-a024-6a4351e7d3e1',
    'The existing Tio Money EAS project must match the owner-verified dashboard UUID');
  assert.equal(expo.extra?.releaseStage, 'phase-0-foundation');
  assert.equal(expo.updates?.url, 'https://u.expo.dev/722e6857-1159-4414-a024-6a4351e7d3e1');
  assert.deepEqual(expo.runtimeVersion, { policy: 'fingerprint' });
});
