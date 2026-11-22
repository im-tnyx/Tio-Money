import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { checkRegistryPublication, verifyTargetRegistryPublications }
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
test('all targets must be checked with independent, sanitized public evidence', async () => {
  const f = fixture();
  const captured = [];
  const fakeFetch = async url => {
    captured.push(url.toString());
    const parsed = url.pathname.endsWith('/keys') ? f.keys : f.metadata;
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
    'https://registry.npmjs.org/%40babel%2Fhelper-compilation-targets/7.29.13',
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
