// Issue #71: check public Sigstore TUF root signing lineage 1..16.
// IMPORTANT: historical root v1 is taken from the SAME immutable upstream Git
// commit as v16. This verifies internal continuity, NOT independently trusted
// out-of-band bootstrap, owner-approved root pin, or historical npm root cause.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, createPublicKey, verify as verifySignature } from 'node:crypto';
import { get } from 'node:https';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_REPOSITORY = 'sigstore/root-signing';
export const IMMUTABLE_SOURCE_COMMIT =
  '25b222a48cda4aa88e1af85605bdd193f5619a60';
export const EXPECTED_ROOT_VERSION = 16;
const BASE = 'https://raw.githubusercontent.com/' + ROOT_REPOSITORY +
  '/' + IMMUTABLE_SOURCE_COMMIT + '/metadata/';
const MAX_ROOT_BYTES = 64 * 1024;
const MAX_KEYS = 32;
const SHA256_ID = /^[0-9a-f]{64}$/;
const HEX_SIGNATURE = /^[0-9a-f]{100,1024}$/i;
const sha256 = b => createHash('sha256').update(b).digest('hex');

export function canonicalTufJson(value) {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    assert.ok(Number.isSafeInteger(value), 'TUF_NONCANONICAL_NUMBER');
    return String(value);
  }
  if (Array.isArray(value)) {
    assert.ok(value.length < 10000, 'TUF_ARRAY_TOO_LARGE');
    return '[' + value.map(canonicalTufJson).join(',') + ']';
  }
  assert.ok(value && typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null), 'TUF_NONCANONICAL_JSON');
  const keys = Object.keys(value);
  assert.ok(keys.length < 10000, 'TUF_OBJECT_TOO_LARGE');
  return '{' + keys.sort().map(key => JSON.stringify(key) + ':' +
    canonicalTufJson(value[key])).join(',') + '}';
}

export function inspectRootShape(doc, version) {
  assert.ok(doc && typeof doc === 'object' && doc.signed &&
    Array.isArray(doc.signatures), 'TUF_ROOT_MALFORMED');
  assert.equal(doc.signed._type, 'root', 'TUF_UNEXPECTED_METADATA_ROLE');
  assert.equal(doc.signed.version, version, 'TUF_ROOT_VERSION_GAP_OR_ROLLBACK');
  assert.ok(Array.isArray(doc.signatures) && doc.signatures.length <= MAX_KEYS * 2,
    'TUF_SIGNATURE_LIST_INVALID');
  const role = doc.signed.roles?.root;
  assert.ok(role && Number.isSafeInteger(role.threshold) &&
    role.threshold >= 1 && role.threshold <= MAX_KEYS &&
    Array.isArray(role.keyids) &&
    role.keyids.length >= role.threshold &&
    role.keyids.length <= MAX_KEYS, 'TUF_ROLE_THRESHOLD_INVALID');
  assert.equal(new Set(role.keyids).size, role.keyids.length,
    'TUF_DUPLICATE_ROOT_ROLE_KEY');
  assert.ok(doc.signed.keys && typeof doc.signed.keys === 'object' &&
    Object.keys(doc.signed.keys).length >= role.keyids.length &&
    Object.keys(doc.signed.keys).length <= MAX_KEYS,
  'TUF_ROOT_KEYSET_INVALID');
  for (const id of role.keyids) {
    assert.match(id, SHA256_ID, 'TUF_ROOT_KEY_ID_INVALID');
    assert.ok(Object.hasOwn(doc.signed.keys, id), 'TUF_ROOT_KEY_MISSING');
  }
  assert.ok(Number.isFinite(Date.parse(doc.signed.expires || '')),
    'TUF_ROOT_EXPIRY_INVALID');
  return role;
}

export function verifyRootThreshold(document, trustedRoleRoot) {
  const trusted = trustedRoleRoot?.signed?.roles?.root;
  assert.ok(trusted && Number.isSafeInteger(trusted.threshold) &&
    trusted.threshold > 0 && trusted.threshold <= MAX_KEYS &&
    Array.isArray(trusted.keyids), 'TUF_NO_TRUSTED_ROOT_ROLE');
  assert.equal(new Set(trusted.keyids).size, trusted.keyids.length,
    'TUF_TRUSTED_DUPLICATE_KEY_ID');
  const canonical = Buffer.from(canonicalTufJson(document.signed), 'utf8');
  const signatures = document?.signatures;
  assert.ok(Array.isArray(signatures) && signatures.length <= MAX_KEYS * 2,
    'TUF_SIGNATURE_LIST_INVALID');
  const seen = new Set();
  const verified = new Set();
  for (const entry of signatures) {
    const id = entry?.keyid;
    assert.match(id || '', SHA256_ID, 'TUF_INVALID_SIGNATURE_KEY_ID');
    assert.ok(!seen.has(id), 'TUF_DUPLICATE_SIGNATURE_KEY_ID');
    seen.add(id);
    if (!trusted.keyids.includes(id)) continue;
    const key = trustedRoleRoot.signed.keys?.[id];
    assert.ok(key && (key.keytype === 'ecdsa' ||
      key.keytype === 'ecdsa-sha2-nistp256') &&
      key.scheme === 'ecdsa-sha2-nistp256',
    'TUF_UNREVIEWED_KEY_TYPE');
    const publicPem = key.keyval?.public;
    assert.ok(typeof publicPem === 'string' && publicPem.length < 2048 &&
      publicPem.includes('-----BEGIN PUBLIC KEY-----'),
    'TUF_INVALID_PUBLIC_KEY');
    const publicKey = createPublicKey(publicPem);
    assert.equal(publicKey.asymmetricKeyType, 'ec', 'TUF_KEY_NOT_EC');
    assert.equal(publicKey.asymmetricKeyDetails?.namedCurve, 'prime256v1',
      'TUF_KEY_NOT_P256');
    assert.match(entry?.sig || '', HEX_SIGNATURE, 'TUF_BAD_SIGNATURE_ENCODING');
    if (verifySignature('sha256', canonical, publicKey,
      Buffer.from(entry.sig, 'hex'))) verified.add(id);
  }
  assert.ok(verified.size >= trusted.threshold,
    'TUF_SIGNATURE_THRESHOLD_NOT_MET');
  return {
    verifiedDistinctSigners: verified.size,
    requiredThreshold: trusted.threshold,
  };
}

export function verifyRootTransition(previous, next) {
  assert.ok(previous?.signed && next?.signed,
    'TUF_TRANSITION_METADATA_MISSING');
  const n = previous.signed.version;
  assert.ok(Number.isSafeInteger(n) && n > 0 && n < EXPECTED_ROOT_VERSION,
    'TUF_INVALID_PREVIOUS_VERSION');
  inspectRootShape(previous, n);
  inspectRootShape(next, n + 1);
  // TUF mandates BOTH the previous root's authorization and the new root's
  // own root-role threshold, including on key rotations.
  const oldRole = verifyRootThreshold(next, previous);
  const newRole = verifyRootThreshold(next, next);
  return { from: n, to: n + 1,
    previousAuthorized: oldRole.verifiedDistinctSigners >= oldRole.requiredThreshold,
    selfAuthorized: newRole.verifiedDistinctSigners >= newRole.requiredThreshold,
    previousSignerCount: oldRole.verifiedDistinctSigners,
    newSignerCount: newRole.verifiedDistinctSigners };
}

export function verifyCurrentRootExpiry(root, now = new Date()) {
  assert.ok(now instanceof Date && !Number.isNaN(now.getTime()),
    'TUF_INVALID_CLOCK');
  inspectRootShape(root, root?.signed?.version);
  assert.ok(Date.parse(root.signed.expires) > now.getTime(),
    'TUF_CURRENT_ROOT_EXPIRED');
  return root.signed.expires;
}

export function rootSourceURL(version) {
  assert.ok(Number.isSafeInteger(version) &&
    version >= 1 && version <= EXPECTED_ROOT_VERSION,
  'TUF_UNREVIEWED_VERSION');
  return new URL(BASE + 'root_history/' + version + '.root.json');
}

export async function fetchImmutableRoot(url, limit = MAX_ROOT_BYTES) {
  assert.ok(url instanceof URL && url.protocol === 'https:' &&
    url.hostname === 'raw.githubusercontent.com' &&
    url.port === '' && url.search === '' && url.hash === '' &&
    !url.username && !url.password &&
    (url.pathname === '/' + ROOT_REPOSITORY + '/' +
      IMMUTABLE_SOURCE_COMMIT + '/metadata/root.json' ||
    /^\/sigstore\/root-signing\/25b222a48cda4aa88e1af85605bdd193f5619a60\/metadata\/root_history\/(?:[1-9]|1[0-6])\.root\.json$/.test(url.pathname)),
  'TUF_SOURCE_NOT_IMMUTABLY_PINNED');
  assert.ok(Number.isSafeInteger(limit) && limit > 0 &&
    limit <= MAX_ROOT_BYTES, 'TUF_RESPONSE_BOUND_INVALID');
  return new Promise((resolve, reject) => {
    const req = get(url, { timeout: 15000, headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'identity',
    } }, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('TUF_SOURCE_NOT_200')); return;
      }
      let length = 0;
      const chunks = [];
      response.on('data', bytes => {
        length += bytes.length;
        if (length > limit) {
          response.destroy(new Error('TUF_SOURCE_TOO_LARGE')); return;
        }
        chunks.push(bytes);
      });
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', () => reject(new Error('TUF_SOURCE_STREAM_ERROR')));
    });
    req.on('timeout', () => req.destroy(new Error('TUF_SOURCE_TIMEOUT')));
    req.on('error', () => reject(new Error('TUF_SOURCE_NETWORK_ERROR')));
  });
}

export async function verifyPublishedRootChain(
  fetchBytes = fetchImmutableRoot, now = new Date()) {
  const transitions = [];
  let previous = null;
  let firstSha = '';
  let lastSha = '';
  let lastDoc = null;
  for (let n = 1; n <= EXPECTED_ROOT_VERSION; n++) {
    // Historical root metadata versions may have expired by *today*; the
    // cryptographic lineage check audits old signatures, not time travel.
    const bytes = await fetchBytes(rootSourceURL(n));
    assert.ok(Buffer.isBuffer(bytes) && bytes.length > 0 &&
      bytes.length <= MAX_ROOT_BYTES, 'TUF_HISTORY_RESPONSE_INVALID');
    const doc = JSON.parse(bytes.toString('utf8'));
    inspectRootShape(doc, n);
    if (n === 1) {
      firstSha = sha256(bytes);
      verifyRootThreshold(doc, doc);
    } else transitions.push(verifyRootTransition(previous, doc));
    previous = doc;
    lastDoc = doc;
    lastSha = sha256(bytes);
  }
  const currentURL = new URL(BASE + 'root.json');
  const currentBytes = await fetchBytes(currentURL);
  assert.ok(Buffer.isBuffer(currentBytes) && currentBytes.length > 0 &&
    currentBytes.length <= MAX_ROOT_BYTES, 'TUF_CURRENT_RESPONSE_INVALID');
  const currentDoc = JSON.parse(currentBytes.toString('utf8'));
  inspectRootShape(currentDoc, EXPECTED_ROOT_VERSION);
  assert.deepEqual(currentDoc, lastDoc,
    'TUF_PUBLISHED_CURRENT_ROOT_MISMATCH');
  const expiry = verifyCurrentRootExpiry(currentDoc, now);
  assert.equal(transitions.length, EXPECTED_ROOT_VERSION - 1,
    'TUF_HISTORY_INCOMPLETE');
  return {
    result: 'ROOT_CHAIN_SIGNATURES_VERIFIED_FROM_UNAPPROVED_BOOTSTRAP',
    historicalRootCount: EXPECTED_ROOT_VERSION,
    verifiedOldAndNewThresholdTransitions: transitions.length,
    allOldAndNewThresholds: transitions.every(x =>
      x.previousAuthorized && x.selfAuthorized),
    lastRootVersion: EXPECTED_ROOT_VERSION,
    lastRootExpires: expiry,
    bootstrapV1Sha256: firstSha,
    signedRootV16HistorySha256: lastSha,
    publishedRootV16Sha256: sha256(currentBytes),
    currentAndHistory16StructurallyEqual: true,
    sourceCommitImmutable: IMMUTABLE_SOURCE_COMMIT,
    sourceAuthenticityBeyondPinnedGitHubCommit: 'NOT_INDEPENDENTLY_ESTABLISHED',
    originalOwnerApprovedBootstrap: 'UNVERIFIED',
    historicalNpm10AttestationRootCause: 'UNVERIFIED',
    signerRawKeysOrMetadataPublished: false,
    trustConfigurationChanged: false,
  };
}

export async function main() {
  let stage = 'INIT', status = 'FAIL_CLOSED', detail = null;
  try {
    stage = 'VERIFY_1_TO_16';
    detail = await verifyPublishedRootChain();
    status = detail.result;
  } catch {
    // No raw GitHub error, signing material or key metadata to logs.
    detail = { stage, failure: 'UNVERIFIED_TUF_CHAIN_OR_SOURCE' };
    process.exitCode = 1;
  } finally {
    console.log(JSON.stringify({
      gate: 'TM-SEC-71-TUF-ROOT-CHAIN',
      status, detail, noRiskAccepted: true,
    }, null, 2));
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
