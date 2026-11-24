// Issue #71 Gate 8: offline-only negative fixtures; never fetch npm registry.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import {
  cleanNpmEnvironment, firstAuditVerdict, LOCK_SHA256,
  validateToolchain, verifyCommittedLock,
} from '../../scripts/security/npm-sigstore-cli-first-attempt.mjs';

const root = resolve(import.meta.dirname, '../..');
const source = (name) => readFileSync(join(root, '.github/preview-eas-cli', name));
const lockBytes = source('package-lock.json');
const manifestBytes = source('package.json');
const toolchain = {
  replica: 'npm10-clean', node: 'v22.16.0', npm: '10.9.2',
  verifier: { sigstore: '3.0.0', sigstoreVerify: '2.0.0', sigstoreTuf: '3.0.0' },
};

test('toolchains pin exact Node/npm and bundled Sigstore versions', () => {
  assert.deepEqual(validateToolchain('npm10-clean', 'v22.16.0', '10.9.2',
    toolchain.verifier), toolchain);
  assert.equal(validateToolchain('npm11-clean', 'v26.8.2', '11.19.1', {
    sigstore: '4.1.1', sigstoreVerify: '3.1.1', sigstoreTuf: '4.0.2',
  }).npm, '11.19.1');
  assert.throws(() => validateToolchain('npm10-clean', 'v22.16.0', '11.19.1',
    toolchain.verifier), /DIAGNOSTIC_NPM_VERSION_CHANGED/);
  assert.throws(() => validateToolchain('unexpected', 'v22.16.0', '10.9.2',
    toolchain.verifier), /UNREVIEWED_DIAGNOSTIC_REPLICA/);
  assert.throws(() => validateToolchain('npm10-clean', 'v22.16.0', '10.9.2', {
    ...toolchain.verifier, sigstore: '2.0.0',
  }), /DIAGNOSTIC_SIGSTORE_VERSION_CHANGED/);
});

test('immutable EAS lock identity and CLI version are verified before executing npm', () => {
  const verified = verifyCommittedLock(lockBytes, manifestBytes);
  assert.equal(verified.lockSha256, LOCK_SHA256);
  assert.equal(verified.lock.packages['node_modules/eas-cli'].version, '27.4.1');
  const corrupted = Buffer.from(lockBytes);
  corrupted[0] = corrupted[0] ^ 1;
  assert.throws(() => verifyCommittedLock(corrupted, manifestBytes),
    /DIAGNOSTIC_EAS_LOCK_BLOB_CHANGED/);
});

test('a failed first attempt is permanently fail-closed and redacts raw output', () => {
  const lock = verifyCommittedLock(lockBytes, manifestBytes).lock;
  const result = firstAuditVerdict({
    status: 1,
    stdout: '1 package has invalid attestation: @babel/helper-compilation-targets@7.29.13\nTOKEN=SUPER_SECRET_ABC',
    stderr: 'AUTH=SENSITIVE_VALUE', signal: null, error: null,
  }, lock, lockBytes, toolchain);
  assert.equal(result.decision, 'FAIL_CLOSED_FIRST_UNMODIFIED_CLI_ATTEMPT');
  assert.equal(result.first.firstFailureBlocksCi, true);
  assert.equal(result.first.originalRegistryHttpResponseSha256, 'NOT_CAPTURED_BY_NPM_CLI');
  assert.equal(result.historicalCause, 'UNVERIFIED');
  assert.equal(result.rawCliOutputRetained, false);
  assert.doesNotMatch(JSON.stringify(result), /SUPER_SECRET_ABC|SENSITIVE_VALUE/);
});

test('only clean zero exit is pass; abnormal signal/error/exit remain failures', () => {
  const lock = verifyCommittedLock(lockBytes, manifestBytes).lock;
  const ok = firstAuditVerdict({
    status: 0, stdout: 'PRIVATE', stderr: '', signal: null, error: null,
  }, lock, lockBytes, toolchain);
  assert.equal(ok.decision, 'PASS_FIRST_UNMODIFIED_CLI_ATTEMPT_ONLY');
  assert.equal(ok.historicalCause, 'UNVERIFIED');
  assert.doesNotMatch(JSON.stringify(ok), /PRIVATE/);
  for (const partial of [
    { status: 0, signal: 'SIGTERM', error: null },
    { status: null, signal: null, error: new Error('private') },
    { status: 1, signal: null, error: null },
  ]) {
    const report = firstAuditVerdict({
      ...partial, stdout: '', stderr: '',
    }, lock, lockBytes, toolchain);
    assert.equal(report.decision, 'FAIL_CLOSED_FIRST_UNMODIFIED_CLI_ATTEMPT');
    assert.doesNotMatch(JSON.stringify(report), /private/);
  }
});

test('npm command environment excludes inherited secrets, proxy and NODE_OPTIONS', () => {
  const env = cleanNpmEnvironment('/tmp/tm-ci-private', '/usr/bin');
  assert.equal(env.HOME, '/tmp/tm-ci-private');
  assert.equal(env.npm_config_ignore_scripts, 'true');
  assert.equal(env.npm_config_registry, 'https://registry.npmjs.org');
  for (const key of ['EXPO_TOKEN', 'GITHUB_TOKEN', 'NODE_AUTH_TOKEN',
    'NODE_OPTIONS', 'HTTP_PROXY', 'HTTPS_PROXY', 'GITHUB_ACTIONS']) {
    assert.equal(env[key], undefined, key);
  }
});

test('the new GitHub job has read-only permissions and no trusted preview secrets', () => {
  const yaml = readFileSync(join(root,
    '.github/workflows/eas-cli-sigstore-diagnostic.yml'), 'utf8');
  const marker = '  cli-first-attempt:\n';
  assert.equal(yaml.split(marker).length, 2);
  const job = yaml.split(marker)[1];
  assert.match(job, /contents: read/);
  assert.match(job, /persist-credentials: false/);
  assert.match(job, /package-manager-cache: false/);
  assert.match(job, /npm-sigstore-cli-first-attempt\.mjs/);
  assert.doesNotMatch(job, /pull_request_target|workflow_run:|id-token: write/);
  assert.doesNotMatch(job, /secrets\.|environment: tio-money-eas-preview-trusted/);
  assert.doesNotMatch(job, /npm install -g|--force|npm audit signatures --omit/);
});
