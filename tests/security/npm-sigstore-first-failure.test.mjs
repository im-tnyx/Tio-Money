import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { firstFailureFingerprint, samplePostFailurePublicRegistry }
  from '../../scripts/security/npm-sigstore-first-failure.mjs';

const id = '@babel/code-frame@7.29.7';
const lock = { packages: {
  'node_modules/@babel/code-frame': {
    version: '7.23.5', integrity: 'sha512-AAAA=',
  },
  'node_modules/@babel/core/node_modules/@babel/code-frame': {
    version: '7.29.7', integrity: 'sha512-BBBB=',
  },
} };
const bytes = Buffer.from('synthetic-committed-lock-data');
const stdout = '1 package has an invalid attestation:\n' +
  id + ' (https://registry.npmjs.org/)\nsecret=must-never-be-printed';

function example() {
  return firstFailureFingerprint({
    stdout, stderr: 'npm error EATTESTATION - token=do-not-report',
    exitStatus: 1, signal: null, npmVersion: '10.9.2',
    verifierVersions: { sigstore: '3.0.0', sigstoreVerify: '2.0.0',
      sigstoreTuf: '3.0.0' }, lock, lockBytes: bytes,
  });
}

test('first-failure fingerprint binds nested exact version and hashes original CLI only', () => {
  const f = example();
  assert.deepEqual(f.reportedInvalidPackageIds, [id]);
  assert.equal(f.firstAttemptResult, 'FAILED_NO_RETRY_OR_WAIVER');
  assert.equal(f.processStatus, 'NONZERO_EXIT');
  assert.equal(f.npmVersion, '10.9.2');
  assert.equal(f.verifierVersions.sigstore, '3.0.0');
  assert.equal(f.originalNpmStdoutSha256,
    createHash('sha256').update(stdout).digest('hex'));
  assert.equal(f.lockSha256, createHash('sha256').update(bytes).digest('hex'));
  assert.equal(f.originalRegistryHttpResponseSha256, 'NOT_CAPTURED_BY_NPM_CLI');
  assert.equal(f.firstFailureBlocksCi, true);
  assert.ok(!JSON.stringify(f).includes('must-never-be-printed'));
  assert.ok(!JSON.stringify(f).includes('do-not-report'));
});

test('unknown or injected package output cannot trigger arbitrary fetch', async () => {
  const f = firstFailureFingerprint({
    stdout: '1 package has an invalid attestation:\n@evil/package@1.2.3\n' +
      'https://registry.npmjs.org/?token=secret',
    stderr: 'AUTH_TOKEN=private', exitStatus: 1,
    npmVersion: 'npm 10', lock, lockBytes: bytes,
  });
  assert.deepEqual(f.reportedInvalidPackageIds, []);
  assert.equal(f.packageIdentityStatus, 'UNVERIFIED');
  assert.equal(f.npmVersion, 'UNVERIFIED');
  const calls = [];
  const result = await samplePostFailurePublicRegistry(f, lock, async url => {
    calls.push(url.toString());
    return { status: 'SAMPLED_AFTER_FAILURE', sha256: 'f'.repeat(64),
      bytes: 256 };
  });
  assert.deepEqual(calls, ['https://registry.npmjs.org/-/npm/v1/keys']);
  assert.equal(result.packageMetadata.length, 0);
  assert.equal(result.originalNpmHttpResponseReplayed, false);
  assert.ok(!JSON.stringify(f).includes('private'));
});

test('post-failure snapshots use only committed package ID and never replay npm audit', async () => {
  const calls = [];
  const result = await samplePostFailurePublicRegistry(example(), lock,
    async (url, limit) => {
      calls.push([url.toString(), limit]);
      return { status: 'SAMPLED_AFTER_FAILURE',
        sha256: 'a'.repeat(64), bytes: 384 };
    });
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.map(x => x[0]), [
    'https://registry.npmjs.org/-/npm/v1/keys',
    'https://registry.npmjs.org/-/npm/v1/attestations/%40babel%2Fcode-frame@7.29.7',
    'https://registry.npmjs.org/%40babel%2Fcode-frame',
  ]);
  assert.equal(result.packageMetadata[0].packageId, id);
  assert.equal(result.packageMetadata[0].attestations.sha256, 'a'.repeat(64));
  assert.equal(result.timing, 'AFTER_FIRST_NPM_CLI_FAILURE');
  assert.equal(result.rawHttpBytesPersistedOrUploaded, false);
});

test('network failures are UNVERIFIED and never convert a failed npm gate to PASS', async () => {
  const result = await samplePostFailurePublicRegistry(example(), lock,
    async () => { throw new Error('authorization=secret-in-stack'); });
  assert.equal(result.registryKeyset.status, 'UNVERIFIED');
  assert.equal(result.packageMetadata[0].attestations.status, 'UNVERIFIED');
  assert.equal(result.packageMetadata[0].packument.status, 'UNVERIFIED');
  assert.ok(!JSON.stringify(result).includes('secret-in-stack'));
  await assert.rejects(samplePostFailurePublicRegistry(
    { ...example(), firstAttemptResult: 'PASS' }, lock, async () => ({})),
  /FIRST_FAILURE_OBSERVATION_REQUIRES_FAILURE/);
});

test('oversized or fake digest snapshot is rejected without exposing original data', async () => {
  const result = await samplePostFailurePublicRegistry(example(), lock,
    async () => ({ status: 'SAMPLED_AFTER_FAILURE', sha256: 'not-a-digest',
      bytes: 222 }));
  assert.equal(result.packageMetadata[0].packument.status, 'UNVERIFIED');
  assert.equal(result.registryKeyset.sha256, null);
});
