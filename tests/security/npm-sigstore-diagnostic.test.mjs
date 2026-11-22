import assert from 'node:assert/strict';
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
  assert.equal(verifyLock(mock(), bytes, sha).length, 3);
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
