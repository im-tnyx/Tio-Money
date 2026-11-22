import assert from 'node:assert/strict';
import { test } from 'node:test';
import { identifyInvalidPackages, identifyInvalidJsonPackages,
  redactRegistrySigningKeys, verifierVersions } from '../../scripts/security/npm-sigstore-metadata.mjs';

const lock = {
  packages: {
    'node_modules/@babel/generator': { version: '7.29.15' },
    'node_modules/@babel/helper-compilation-targets': { version: '7.29.13' },
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


test('npm JSON invalid[] isolates locked identities; never echoes unrelated records or secrets', () => {
  const input = JSON.stringify({
    invalid: [
      { name: '@babel/generator', version: '7.29.15',
        attestations: { raw: 'secret-certificate-never-output' } },
      { name: '@unreviewed/private', version: '0.0.1',
        token: 'secret-token-never-output' },
      { name: '@babel/helper-module-transforms', version: '7.29.13' },
      { name: '@babel/generator', version: '7.29.15' },
      { name: '@babel/generator', version: '9.9.9' },
      null,
    ],
    invalidMessage: 'credential=secret-creds-never-output',
  });
  const v = identifyInvalidJsonPackages(input, lock);
  assert.equal(v.jsonInvalidArrayStatus, 'PRESENT');
  assert.equal(v.jsonInvalidCount, 6);
  assert.deepEqual(v.reportedInvalidJsonPackageIds, [
    '@babel/generator@7.29.15', '@babel/helper-module-transforms@7.29.13',
  ]);
  assert.equal(v.jsonPackageIdentityStatus, 'REPORTED_IN_JSON_INVALID_LIST');
  assert.equal(v.rawOutputRetained, false);
  assert.ok(!JSON.stringify(v).includes('secret-'));
  assert.ok(!JSON.stringify(v).includes('@unreviewed/private'));
});

test('unknown, malformed and oversized npm JSON remains UNVERIFIED, not success', () => {
  for (const input of ['not-json', '{"error":{"message":"invalid attestation"}}',
    '{"invalid": {"name":"@babel/generator","version":"7.29.15"}}',
    'x'.repeat(6 * 1024 * 1024 + 1)]) {
    const v = identifyInvalidJsonPackages(input, lock);
    assert.equal(v.jsonInvalidArrayStatus, 'UNVERIFIED');
    assert.equal(v.jsonPackageIdentityStatus, 'UNVERIFIED');
    assert.deepEqual(v.reportedInvalidJsonPackageIds, []);
  }
  const empty = identifyInvalidJsonPackages('{"invalid":[]}', lock);
  assert.equal(empty.jsonInvalidArrayStatus, 'PRESENT');
  assert.equal(empty.jsonInvalidCount, 0);
  assert.equal(empty.jsonPackageIdentityStatus, 'UNVERIFIED');
});

test('npm JSON invalid[] never infers package identity from unrelated verified or missing lists', () => {
  const json = JSON.stringify({
    verified: [{ name: '@babel/generator', version: '7.29.15' }],
    missing: [{ name: '@babel/helper-module-transforms', version: '7.29.13' }],
    invalid: [{ name: '@unknown/other', version: '1.0.0' }],
  });
  const v = identifyInvalidJsonPackages(json, lock);
  assert.deepEqual(v.reportedInvalidJsonPackageIds, []);
  assert.equal(v.jsonPackageIdentityStatus, 'UNVERIFIED');
});


test('npm JSON invalid[] recognizes fourth exact lockfile package only', () => {
  const raw = JSON.stringify({ invalid: [
    { name: '@babel/helper-compilation-targets', version: '7.29.13',
      signedBundle: 'never-leak-sensitive-bundle' },
    { name: '@babel/helper-compilation-targets', version: '7.29.99' },
    { name: '@another/package', version: '1.2.3' },
  ] });
  const result = identifyInvalidJsonPackages(raw, lock);
  assert.equal(result.jsonInvalidCount, 3);
  assert.deepEqual(result.reportedInvalidJsonPackageIds,
    ['@babel/helper-compilation-targets@7.29.13']);
  assert.equal(result.jsonPackageIdentityStatus, 'REPORTED_IN_JSON_INVALID_LIST');
  assert.ok(!JSON.stringify(result).includes('never-leak-sensitive-bundle'));
});
