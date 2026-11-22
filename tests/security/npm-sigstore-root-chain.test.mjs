import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createPublicKey, generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { canonicalTufJson, inspectRootShape, verifyRootThreshold,
  verifyRootTransition, verifyCurrentRootExpiry, rootSourceURL,
  verifyPublishedRootChain } from '../../scripts/security/npm-sigstore-root-chain.mjs';

const keys = Array.from({ length: 3 }, (_, i) => {
  const kp = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  return { id: String(i + 1).repeat(64), privateKey: kp.privateKey,
    publicPem: kp.publicKey.export({ format: 'pem', type: 'spki' }) };
});
function root(version, signers = keys.slice(0, 2), roleIds = keys.map(x => x.id)) {
  const signed = {
    _type: 'root', version, expires: '2027-06-01T00:00:00Z',
    keys: Object.fromEntries(keys.map(k => [k.id, {
      keytype: 'ecdsa', scheme: 'ecdsa-sha2-nistp256',
      keyval: { public: k.publicPem },
    }])),
    roles: { root: { keyids: roleIds, threshold: 2 } },
  };
  const content = Buffer.from(canonicalTufJson(signed));
  return { signed, signatures: signers.map(key => ({
    keyid: key.id,
    sig: sign('sha256', content, key.privateKey).toString('hex'),
  })) };
}
test('TUF OLPC canonical JSON keeps PEM newlines literal and sorts keys', () => {
  const signed = { z: 'PEM HEADER\nPEM BODY\n', a: 'backslash\\quote"' };
  const result = canonicalTufJson(signed);
  assert.equal(result, '{"a":"backslash\\\\quote\\\"","z":"PEM HEADER\nPEM BODY\n"}');
  assert.notEqual(result, JSON.stringify(signed));
});

test('TUF canonical JSON sorts object keys but preserves arrays', () => {
  assert.equal(canonicalTufJson({ z: 1, a: { d: 2, b: true }, x: ['b', 'a'] }),
    '{"a":{"b":true,"d":2},"x":["b","a"],"z":1}');
  assert.throws(() => canonicalTufJson(1.25), /TUF_NONCANONICAL_NUMBER/);
});
test('root transition requires authentic previous AND new threshold signatures', () => {
  const a = root(1), b = root(2);
  const verdict = verifyRootTransition(a, b);
  assert.equal(verdict.from, 1);
  assert.equal(verdict.to, 2);
  assert.equal(verdict.previousSignerCount, 2);
  assert.equal(verdict.newSignerCount, 2);
  assert.equal(verifyRootThreshold(b, a).verifiedDistinctSigners, 2);
});
test('fail closed: altered signed metadata, partial threshold and duplicate signer', () => {
  const a = root(1), b = root(2);
  const tamper = structuredClone(b);
  tamper.signed.expires = '2030-01-01T00:00:00Z';
  assert.throws(() => verifyRootTransition(a, tamper),
    /TUF_SIGNATURE_THRESHOLD_NOT_MET/);
  assert.throws(() => verifyRootTransition(a, root(2, [keys[0]])),
    /TUF_SIGNATURE_THRESHOLD_NOT_MET/);
  const dup = root(2, [keys[0], keys[0]]);
  assert.throws(() => verifyRootThreshold(dup, a),
    /TUF_DUPLICATE_SIGNATURE_KEY_ID/);
});
test('fail closed: old keys cannot be replaced without old threshold', () => {
  const a = root(1);
  const outsiderPair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const outsider = { id: 'f'.repeat(64), privateKey: outsiderPair.privateKey,
    publicPem: outsiderPair.publicKey.export({ format: 'pem', type: 'spki' }) };
  const next = root(2);
  next.signed.keys[outsider.id] = {
    keytype: 'ecdsa', scheme: 'ecdsa-sha2-nistp256',
    keyval: { public: outsider.publicPem },
  };
  next.signed.roles.root.keyids = [keys[0].id, outsider.id];
  const signed = Buffer.from(canonicalTufJson(next.signed));
  next.signatures = [keys[0], outsider].map(key => ({
    keyid: key.id, sig: sign('sha256', signed, key.privateKey).toString('hex'),
  }));
  // New role has 2 valid signatures but predecessor recognizes only ONE.
  assert.equal(verifyRootThreshold(next, next).verifiedDistinctSigners, 2);
  assert.throws(() => verifyRootTransition(a, next),
    /TUF_SIGNATURE_THRESHOLD_NOT_MET/);
  const properly = root(2, keys, [keys[1].id, keys[2].id]);
  assert.equal(verifyRootTransition(a, properly).previousSignerCount, 3);
});
test('reject root version skipping, rollback, stale current root and invalid key', () => {
  assert.throws(() => verifyRootTransition(root(1), root(3)),
    /TUF_ROOT_VERSION_GAP_OR_ROLLBACK/);
  assert.throws(() => verifyRootTransition(root(2), root(1)),
    /TUF_ROOT_VERSION_GAP_OR_ROLLBACK/);
  assert.throws(() => verifyCurrentRootExpiry(root(16),
    new Date('2027-07-01T00:00:00Z')), /TUF_CURRENT_ROOT_EXPIRED/);
  const invalid = root(1);
  invalid.signed.roles.root.keyids.push(invalid.signed.roles.root.keyids[0]);
  assert.throws(() => inspectRootShape(invalid, 1),
    /TUF_DUPLICATE_ROOT_ROLE_KEY/);
});
test('immutable source URLs exclude arbitrary paths and mutable ref', () => {
  const x = rootSourceURL(16);
  assert.ok(x.href.includes('/25b222a48cda4aa88e1af85605bdd193f5619a60/'));
  assert.throws(() => rootSourceURL(17), /TUF_UNREVIEWED_VERSION/);
  assert.throws(() => rootSourceURL(0), /TUF_UNREVIEWED_VERSION/);
});
test('published chain rejects missing/invalid root evidence without leaking raw data', async () => {
  const history = new Map();
  for (let n = 1; n <= 16; n++) history.set('' + n, root(n));
  const fetchFake = async url => {
    const version = /root_history\/(\d+)\.root\.json/.exec(url.pathname)?.[1];
    return Buffer.from(JSON.stringify(version ? history.get(version) :
      history.get('16')));
  };
  const pass = await verifyPublishedRootChain(fetchFake,
    new Date('2026-11-22T00:00:00Z'));
  assert.equal(pass.result,
    'ROOT_V1_TO_V16_SIGNING_CHAIN_VERIFIED_FROM_UNAPPROVED_BOOTSTRAP');
  assert.equal(pass.verifiedOldAndNewThresholdTransitions, 15);
  assert.equal(pass.observedBootstrapVersion, 1);
  assert.equal(pass.documentedModernRecommendedBootstrap, 10);
  assert.equal(pass.originalOwnerApprovedBootstrap, 'UNVERIFIED');
  history.get('8').signed.expires = '2030-01-01T00:00:00Z';
  await assert.rejects(verifyPublishedRootChain(fetchFake), /TUF_SIGNATURE_THRESHOLD_NOT_MET/);
});


test('legacy SEC1 uncompressed P256 root keys verify without weakening threshold', () => {
  const specimen = root(1);
  for (const k of keys) {
    // Convert only the existing public key to historical SEC1 format.
    const fromPem = specimen.signed.keys[k.id].keyval.public;
    const pub = createPublicKey(fromPem).export({ format: 'jwk' });
    const sec1 = Buffer.concat([
      Buffer.from([4]), Buffer.from(pub.x, 'base64url'),
      Buffer.from(pub.y, 'base64url'),
    ]).toString('hex');
    specimen.signed.keys[k.id].keyval.public = sec1;
    specimen.signed.keys[k.id].keytype = 'ecdsa-sha2-nistp256';
  }
  const encoded = Buffer.from(canonicalTufJson(specimen.signed));
  specimen.signatures = keys.slice(0, 2).map(k => ({
    keyid: k.id,
    sig: sign('sha256', encoded, k.privateKey).toString('hex'),
  }));
  assert.equal(verifyRootThreshold(specimen, specimen).verifiedDistinctSigners, 2);
  const bad = structuredClone(specimen);
  bad.signed.keys[keys[0].id].keyval.public = '03'.repeat(65);
  assert.throws(() => verifyRootThreshold(bad, bad),
    /TUF_INVALID_PUBLIC_KEY/);
});
