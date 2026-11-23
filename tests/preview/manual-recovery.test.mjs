import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { candidatePorts, startupFailureCategory } from '../../scripts/start-codespace-expo.mjs';
import { preflightDecision } from '../../.github/scripts/preflight-pr-codespaces-preview.mjs';
import { metroMapUrl } from '../../.github/scripts/verify-codespace-served-source.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path) => readFileSync(join(root, path), 'utf8');

test('manual selection uses a bounded alternate range without adopting a foreign port', () => {
  assert.deepEqual(candidatePorts(false), [8081]);
  assert.deepEqual(candidatePorts(false, 8083), [8083]);
  assert.throws(() => candidatePorts(false, 8090), /Unapproved/);
  assert.deepEqual(candidatePorts(true), [8081, 8082, 8083, 8084, 8085]);
  assert.equal(preflightDecision(false, null, null, false, 'EMPTY', true), 'FOREIGN_PORT');
  assert.throws(() => preflightDecision(false, null, null, false), /occupied/);
  assert.throws(() => preflightDecision(true, { pid: 77, startTicks: '2' }, null, false, 'FOREIGN', true), /ownership/);
});

test('every managed Metro port disables Codespaces auto-forwarding and stays private', () => {
  const { portsAttributes } = JSON.parse(read('.devcontainer/devcontainer.json'));
  for (const port of candidatePorts(true)) {
    assert.equal(portsAttributes[port]?.onAutoForward, 'ignore', `auto-forwarding for port ${port}`);
    assert.equal(portsAttributes[port]?.visibility, 'private', `visibility for port ${port}`);
  }
});

test('manual dispatch forces sync and owned restart; automatic pushes preserve healthy Metro', () => {
  const workflow = read('.github/workflows/tio-money-eas-pr-preview.yml');
  const starter = read('scripts/start-codespace-expo.mjs');
  assert.match(workflow, /if \[\[ "\$EVENT_NAME" == "workflow_dispatch" \]\]; then\s+echo 'no_op=false'/);
  assert.match(workflow, /mode="--manual"/);
  assert.match(starter, /current && \(manual \|\| !compatibleRuntime/);
  assert.match(starter, /await startManaged\(fingerprint, manual, recoveryPort\)/);
  assert.match(starter, /await startManaged\(fingerprint, false, recoveryPort\)/);
  assert.match(starter, /const recoveryPort = current\?\.port \?\? PORT/);
  assert.doesNotMatch(starter, /process\.kill\([^\n]*8081/);
});

test('selected port is used for the local source-map probe', () => {
  const manifest = { launchAsset: { url: 'https://example.on.expo.app/index.bundle?platform=ios&dev=true' } };
  assert.equal(metroMapUrl(manifest, 'ios', 8083), 'http://127.0.0.1:8083/index.map?platform=ios&dev=true');
  const probe = read('.github/scripts/verify-codespace-served-source.mjs');
  assert.match(probe, /const port = requirePreviewListener\(\)/);
  assert.match(probe, /if \(requirePreviewListener\(\) !== port\)/);
});

test('startup diagnostics emit fixed categories without leaking raw log content', () => {
  assert.equal(startupFailureCategory('EADDRINUSE exp://private'), 'PORT_CONFLICT');
  assert.equal(startupFailureCategory('ETIMEDOUT token=secret'), 'NETWORK');
  assert.equal(startupFailureCategory('secret=private exp://signed'), 'UNKNOWN');
  assert.match(read('scripts/start-codespace-expo.mjs'), /stat\.size > 2097152/);
});
