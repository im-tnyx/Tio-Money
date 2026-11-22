import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { checkRegistryPublication, verifyTargetRegistryPublications,
  classifyRegistryProofFailure, safeRegistryFailureLocation }
  from '../../scripts/security/npm-sigstore-registry.mjs';

const name = '@babel/helper-compilation-targets', version = '7.29.13';
const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const der = publicKey.export({ format: 'der', type: 'spki' });
const pin = { keyid: 'SHA256:test-pin-abc=', spkiSha256Base64:
  createHash('sha256').update(der).digest('base64'), anchor: 'SYNTHETIC_TEST_PIN' };
const integrity = 'sha512-' + createHash('sha512').update('fixture').digest('base64');
const tarball = 'https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.13.tgz';
const lock = { packages: { ['node_modules/' + name]: { version, integrity,
  resolved: tarball } } };
function fixture() {
  const msg = Buffer.from(name + '@' + version + ':' + integrity);
  return {
    metadata: { name, version, dist: {
      integrity, tarball,
      signatures: [{ keyid: pin.keyid, sig: sign('sha256', msg, privateKey).toString('base64') }],
    } },
    keys: { keys: [{ keyid: pin.keyid, key: der.toString('base64'),
      expires: null, keytype: 'ecdsa-sha2-nistp256', scheme: 'ecdsa-sha2-nistp256' }] },
  };
}
test('pinned registry key P256 ECDSA signature validates exact lockfile SRI', () => {
  const f = fixture();
  const out = checkRegistryPublication(f.metadata, f.keys, lock, name, version, pin);
  assert.equal(out.status, 'PASS_PINNED_P256_ECDSA');
  assert.equal(out.rawSignatureOrPublicKeyRetained, false);
  assert.ok(!JSON.stringify(out).includes(der.toString('base64')));
});
test('tampered digest, signature, key and unreviewed key ID fail closed', () => {
  const modify = [
    f => { f.metadata.dist.integrity = 'sha512-tampered'; },
    f => { f.metadata.dist.signatures[0].sig = Buffer.from('fake').toString('base64'); },
    f => { f.keys.keys[0].key = Buffer.from('spoof').toString('base64'); },
    f => { f.metadata.dist.signatures[0].keyid = 'SHA256:other'; },
    f => { f.metadata.dist.tarball = 'https://evil.invalid/file.tgz'; },
  ];
  for (const mutate of modify) {
    const f = fixture(); mutate(f);
    assert.throws(() => checkRegistryPublication(f.metadata, f.keys, lock, name,
      version, pin));
  }
});
test('signed key expiration, algorithm downgrade, other package and wrong version fail', () => {
  let f = fixture(); f.keys.keys[0].expires = '2020-01-01T00:00:00Z';
  assert.throws(() => checkRegistryPublication(f.metadata, f.keys, lock, name,
    version, pin), /REGISTRY_SIGNING_KEY_EXPIRED/);
  f = fixture(); f.keys.keys[0].keytype = 'rsa';
  assert.throws(() => checkRegistryPublication(f.metadata, f.keys, lock, name,
    version, pin), /REGISTRY_KEY_UNEXPECTED_ALGORITHM/);
  f = fixture(); f.metadata.name = '@evil/something';
  assert.throws(() => checkRegistryPublication(f.metadata, f.keys, lock, name,
    version, pin), /REGISTRY_METADATA_NAME_MISMATCH/);
  f = fixture();
  assert.throws(() => checkRegistryPublication(f.metadata, f.keys, lock, name,
    '7.29.14', pin), /MISSING_EXACT_LOCKED_TARGET/);
});
test('missing dist signature or unexpected signing key ID cannot pass', () => {
  let f = fixture();
  delete f.metadata.dist.signatures;
  assert.throws(() => checkRegistryPublication(f.metadata, f.keys, lock, name, version, pin),
    /REGISTRY_DIST_SIGNATURES_ABSENT/);
  f = fixture();
  f.metadata.dist.signatures[0].keyid = 'SHA256:other-key';
  assert.throws(() => checkRegistryPublication(f.metadata, f.keys, lock, name, version, pin),
    /REGISTRY_KEY_ID_MISMATCH/);
});

test('all targets must be checked with independent, sanitized public evidence', async () => {
  const f = fixture();
  const captured = [];
  const fakeFetch = async url => {
    captured.push(url.toString());
    const parsed = url.pathname.endsWith('/keys') ? f.keys :
      { name, versions: { [version]: f.metadata } };
    return { parsed, sha256: 'f'.repeat(64) };
  };
  const ret = await verifyTargetRegistryPublications(lock, { [name]: version },
    fakeFetch, pin);
  assert.equal(ret.status, 'PASS_PINNED_REGISTRY_KEY_ECDSA');
  assert.equal(ret.evidence.length, 1);
  assert.equal(ret.capture, 'SEPARATELY_OBSERVED_PUBLIC_HTTP_RESPONSES');
  assert.equal(ret.sameResponseVerifierDifferential, 'UNVERIFIED');
  assert.equal(ret.rawPackumentOrSigningKeysUploaded, false);
  assert.deepEqual(captured, [
    'https://registry.npmjs.org/-/npm/v1/keys',
    'https://registry.npmjs.org/%40babel%2Fhelper-compilation-targets',
  ]);
});


test('ECDSA publisher check selects matching nested package version, not root', () => {
  const f = fixture();
  const nested = { packages: {
    ['node_modules/' + name]: { version: '7.23.5', integrity: 'sha512-old',
      resolved: 'https://registry.npmjs.org/@babel/helper-compilation-targets/-/old.tgz' },
    ['node_modules/@babel/core/node_modules/' + name]: lock.packages['node_modules/' + name],
    ['node_modules/@babel/traverse/node_modules/' + name]: { ...lock.packages['node_modules/' + name] },
  } };
  const proof = checkRegistryPublication(f.metadata, f.keys, nested, name, version, pin);
  assert.equal(proof.status, 'PASS_PINNED_P256_ECDSA');
  nested.packages['node_modules/@babel/traverse/node_modules/' + name].integrity = 'sha512-other';
  assert.throws(() => checkRegistryPublication(f.metadata, f.keys, nested, name, version, pin),
    /INCONSISTENT_NESTED_TARGET_SRI/);
});


test('registry diagnosis is bounded allowlisted status, never a raw exception leak', () => {
  assert.equal(classifyRegistryProofFailure(new Error('REGISTRY_METADATA_HTTP_NON_200')),
    'REGISTRY_METADATA_HTTP_NON_200');
  assert.equal(classifyRegistryProofFailure(new Error('REGISTRY_ECDSA_SIGNATURE_INVALID')),
    'REGISTRY_ECDSA_SIGNATURE_INVALID');
  assert.equal(classifyRegistryProofFailure(
    new Error('token=secret-not-allowed; private signing document')),
    'UNVERIFIED_REGISTRY_PROOF_FAILURE');
});


test('failure location only exposes trusted module line, never sensitive stack', () => {
  const secret = new TypeError('token=secret-hide');
  secret.code = 'ERR_INVALID_ARG_TYPE';
  secret.stack = 'TypeError: token=secret-hide\nat getPublicJson ' +
    '(file:///home/runner/work/repo/scripts/security/npm-sigstore-registry.mjs:76:11)' +
    '\nat https://registry.npmjs.org/?token=secret-hide';
  const safe = safeRegistryFailureLocation(secret);
  assert.equal(safe.kind, 'TypeError');
  assert.equal(safe.code, 'ERR_INVALID_ARG_TYPE');
  assert.equal(safe.sourceFile, 'npm-sigstore-registry.mjs');
  assert.equal(safe.sourceLine, 76);
  assert.equal(safe.messageOrStackRetained, false);
  assert.ok(!JSON.stringify(safe).includes('secret-hide'));
});


test('version must be explicitly present in signed packument, never dist-tag guessed', async () => {
  const f = fixture();
  const fakeFetch = async url => ({
    parsed: url.pathname.endsWith('/keys') ? f.keys :
      { name, 'dist-tags': { latest: version }, versions: {} },
    sha256: 'f'.repeat(64),
  });
  await assert.rejects(verifyTargetRegistryPublications(lock, { [name]: version },
    fakeFetch, pin), /REGISTRY_MISSING_EXACT_VERSION_IN_PACKUMENT/);
});
