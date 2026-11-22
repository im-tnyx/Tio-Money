import assert from 'node:assert/strict';
import { test } from 'node:test';
import { identifyInvalidPackages, redactRegistrySigningKeys,
  verifierVersions } from '../../scripts/security/npm-sigstore-metadata.mjs';

const lock = {
  packages: {
    'node_modules/@babel/generator': { version: '7.29.15' },
    'node_modules/@babel/helper-module-transforms': { version: '7.29.13' },
    'node_modules/@babel/helper-validator-identifier': { version: '7.29.7' },
  },
};

test('extracts exact names and versions from npm10 invalid-attestation list', () => {
  const output = 'audited 498 packages\n3 packages have invalid attestations:\n' +
    '@babel/generator@7.29.15 (https://registry.npmjs.org/)\n' +
    '@babel/helper-module-transforms@7.29.13 (https://registry.npmjs.org/)\n' +
    '@babel/helper-validator-identifier@7.29.7 (https://registry.npmjs.org/)\n' +
    'Someone might have tampered with these packages.';
  const result = identifyInvalidPackages(output, lock);
  assert.deepEqual(result.reportedInvalidPackageIds, [
    '@babel/generator@7.29.15',
    '@babel/helper-module-transforms@7.29.13',
    '@babel/helper-validator-identifier@7.29.7',
  ]);
  assert.equal(result.invalidAttestationCount, 3);
  assert.equal(result.packageIdentityStatus, 'REPORTED_IN_INVALID_ATTESTATION_LIST');
});

test('singular npm10 failure and unknown package remain strictly scoped', () => {
  const result = identifyInvalidPackages(
    '1 package has invalid attestation:\n@unreviewed/malicious@5.5.5\n' +
    'password=secret-never-echo\nEINTEGRITY', lock);
  assert.equal(result.invalidAttestationCount, 1);
  assert.deepEqual(result.reportedInvalidPackageIds, []);
  assert.equal(result.packageIdentityStatus, 'UNVERIFIED');
  assert.deepEqual(result.npmErrorCodes, ['EINTEGRITY']);
  assert.ok(!JSON.stringify(result).includes('secret-never-echo'));
  assert.ok(!JSON.stringify(result).includes('@unreviewed/malicious'));
});

test('unrelated package names in raw headers are not misidentified', () => {
  const output = 'npm audit checking @babel/generator@7.29.15\n' +
    'invalid attestation error: network failure';
  const result = identifyInvalidPackages(output, lock);
  assert.equal(result.packageIdentityStatus, 'UNVERIFIED');
  assert.deepEqual(result.reportedInvalidPackageIds, []);
});

test('registry trust keys expose IDs but not raw public key data', () => {
  const doc = { keys: [{ keyid: 'SHA256:AbCdef123+/',
    key: 'SECRET_PUBLIC_KEY_MATERIAL', keytype: 'ecdsa-sha2-nistp256',
    scheme: 'ecdsa-sha2-nistp256', expires: null }] };
  const data = redactRegistrySigningKeys(doc);
  assert.equal(data.length, 1);
  assert.equal(data[0].keyid, 'SHA256:AbCdef123+/');
  assert.equal(data[0].publicKeyMaterialRetained, false);
  assert.ok(!JSON.stringify(data).includes('SECRET_PUBLIC_KEY_MATERIAL'));
  assert.throws(() => redactRegistrySigningKeys({ keys: [] }), /REGISTRY_KEY_METADATA_MISSING/);
});

test('unknown npm global root provides UNVERIFIED versions, never invented data', () => {
  const versions = verifierVersions('/nonexistent-no-secrets-global-root');
  assert.equal(versions.sigstore, 'UNVERIFIED');
  assert.equal(versions.sigstoreVerify, 'UNVERIFIED');
  assert.equal(versions.sigstoreTuf, 'UNVERIFIED');
});
