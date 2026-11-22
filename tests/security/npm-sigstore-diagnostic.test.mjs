import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { test } from 'node:test';
import { AFFECTED, gitBlobSha1, verifyLock, sanitizeFailure,
  isIncludeAttestationsSupported } from '../../scripts/security/npm-sigstore-diagnostic.mjs';

const pkg = (name, version) => ({
  version, resolved: 'https://registry.npmjs.org/' + name + '/-/' +
    name.split('/').at(-1) + '-' + version + '.tgz',
  integrity: 'sha512-abcDEF123+/=',
});
const mock = () => ({ packages: {
  '': { dependencies: { 'eas-cli': '27.4.1' } },
  ...Object.fromEntries(Object.entries(AFFECTED).map(([name, version]) =>
    ['node_modules/' + name, pkg(name, version)])),
} });

test('git blob hashing uses exact Git framing', () => {
  assert.equal(gitBlobSha1(Buffer.from('hello\n')), 'ce013625030ba8dba906f756967f9e9ca394464a');
});

test('lock identity, registry and SRI are mandatory', () => {
  const bytes = Buffer.from('synthetic-fixture');
  const sha = gitBlobSha1(bytes);
  assert.equal(verifyLock(mock(), bytes, sha).length, 6);
  assert.throws(() => verifyLock(mock(), bytes, 'f'.repeat(40)), /LOCKFILE_IDENTITY_CHANGED/);
  const changed = mock();
  changed.packages['node_modules/@babel/generator'].integrity = '';
  assert.throws(() => verifyLock(changed, bytes, sha), /MISSING_SRI/);
  changed.packages['node_modules/@babel/generator'].integrity = 'sha512-abc=';
  changed.packages['node_modules/@babel/generator'].resolved = 'https://evil.example/bad.tgz';
  assert.throws(() => verifyLock(changed, bytes, sha), /UNTRUSTED_REGISTRY/);
});

test('failure summaries never copy raw network output or credentials', () => {
  const output = '3 packages have invalid attestations:\n@babel/generator@7.29.15\n' +
    'password=never-print-this\nhttps://registry.npmjs.org/?token=hidden';
  const result = sanitizeFailure(output);
  assert.equal(result.invalidAttestationCount, 3);
  assert.deepEqual(result.affectedPackagesMentioned, ['@babel/generator']);
  assert.ok(!JSON.stringify(result).includes('never-print-this'));
  assert.equal(result.rawOutputRetained, false);
});

test('unsupported npm is not claimed as verified JSON attestation output', () => {
  assert.equal(isIncludeAttestationsSupported('undefined\n'), false);
  assert.equal(isIncludeAttestationsSupported('false\n'), true);
});


test('new fourth Babel target is mandatory and locked to exact version', () => {
  const bytes = Buffer.from('synthetic-fourth-target');
  const sha = gitBlobSha1(bytes);
  const name = '@babel/helper-compilation-targets';
  const good = mock();
  assert.equal(good.packages['node_modules/' + name].version, '7.29.13');
  assert.equal(verifyLock(good, bytes, sha).length, 6);
  delete good.packages['node_modules/' + name];
  assert.throws(() => verifyLock(good, bytes, sha),
    /MISSING_LOCKED_PACKAGE_@babel\/helper-compilation-targets/);
  const changed = mock();
  changed.packages['node_modules/' + name].version = '7.29.14';
  assert.throws(() => verifyLock(changed, bytes, sha),
    /PACKAGE_VERSION_CHANGED_@babel\/helper-compilation-targets/);
});

test('single failing npm attestation identifies fourth package without leaking output', () => {
  const raw = 'audited 498 packages\n1 package has an invalid attestation:\n' +
    '@babel/helper-compilation-targets@7.29.13 (https://registry.npmjs.org/)\n' +
    'password=secret-credential-do-not-emit';
  const result = sanitizeFailure(raw, mock());
  assert.equal(result.invalidAttestationCount, 1);
  assert.deepEqual(result.reportedInvalidPackageIds,
    ['@babel/helper-compilation-targets@7.29.13']);
  assert.equal(result.packageIdentityStatus, 'REPORTED_IN_INVALID_ATTESTATION_LIST');
  assert.ok(!JSON.stringify(result).includes('secret-credential'));
  assert.equal(result.rawOutputRetained, false);
});


test('new @babel/types first-failure target is bound to exact EAS lock version', () => {
  const bytes = Buffer.from('synthetic-types-target');
  const sha = gitBlobSha1(bytes);
  const name = '@babel/types';
  const good = mock();
  assert.equal(AFFECTED[name], '7.29.15');
  assert.equal(verifyLock(good, bytes, sha).length, 6);
  delete good.packages['node_modules/' + name];
  assert.throws(() => verifyLock(good, bytes, sha),
    /MISSING_LOCKED_PACKAGE_@babel\/types/);
  const wrong = mock();
  wrong.packages['node_modules/' + name].version = '7.29.14';
  assert.throws(() => verifyLock(wrong, bytes, sha),
    /PACKAGE_VERSION_CHANGED_@babel\/types/);
  const failure = sanitizeFailure('2 packages have invalid attestations:\n' +
    '@babel/types@7.29.15 (https://registry.npmjs.org/)\n' +
    'token=never-publish-this', mock());
  assert.deepEqual(failure.reportedInvalidPackageIds, ['@babel/types@7.29.15']);
  assert.ok(!JSON.stringify(failure).includes('never-publish-this'));
});
