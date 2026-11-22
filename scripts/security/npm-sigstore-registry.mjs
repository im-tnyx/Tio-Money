// Issue #71: independently re-check npm registry ECDSA publish signatures.
// This is NOT an independent TUF trust-root pin or historical npm10 root-cause proof.
// Active npm registry SPKI digest was independently compared with the public npm docs
// and 2026-11-22 read-only https://registry.npmjs.org/-/npm/v1/keys endpoint.
// Never print public keys, signatures, raw metadata or network error messages.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, createPublicKey, verify as verifySignature } from 'node:crypto';
import { get } from 'node:https';
import { selectLockedTarget } from './npm-sigstore-proof.mjs';

const ORIGIN = 'https://registry.npmjs.org';
const PIN = Object.freeze({
  keyid: 'SHA256:DhQ8wR5APBvFHLF/+Tc+AYvPOdTpcIDqOhxsBHRwC7U',
  spkiSha256Base64: '+xkKRiEjRDUAy822UZYj5xeenzjYStTpNity0raLYsE=',
  // Key is public, but only the fingerprint is retained in evidence.
  anchor: 'REVIEWED_STATIC_SPKI_FINGERPRINT',
});
function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
function exactBase64(value) {
  assert.ok(typeof value === 'string' && value.length > 4 &&
    value.length < 2048 && /^[A-Za-z0-9+/]+={0,2}$/.test(value),
    'INVALID_SIGNATURE_OR_KEY_ENCODING');
  const decoded = Buffer.from(value, 'base64');
  assert.equal(decoded.toString('base64'), value, 'NONCANONICAL_SIGNATURE_OR_KEY_ENCODING');
  return decoded;
}
export function checkRegistryPublication(metadata, keys, lock, name, version,
  pin = PIN) {
  assert.ok(/^@babel\/[a-z0-9-]+$/.test(name), 'UNREVIEWED_REGISTRY_PACKAGE');
  assert.match(version, /^\d+\.\d+\.\d+$/, 'UNREVIEWED_REGISTRY_VERSION');
  const { manifest } = selectLockedTarget(lock, name, version);
  assert.ok(manifest?.resolved?.startsWith(ORIGIN + '/') &&
    manifest.resolved.endsWith('.tgz'), 'REGISTRY_ORIGIN_UNTRUSTED');
  assert.match(manifest?.integrity || '', /^sha512-[A-Za-z0-9+/=]+$/,
    'REGISTRY_LOCK_SRI_MISSING');
  assert.equal(metadata?.name, name, 'REGISTRY_METADATA_NAME_MISMATCH');
  assert.equal(metadata?.version, version, 'REGISTRY_METADATA_VERSION_MISMATCH');
  assert.equal(metadata?.dist?.integrity, manifest.integrity,
    'REGISTRY_METADATA_SRI_MISMATCH');
  assert.equal(metadata?.dist?.tarball, manifest.resolved,
    'REGISTRY_METADATA_TARBALL_MISMATCH');
  const matchedKeys = (keys?.keys || []).filter(x => x?.keyid === pin.keyid);
  assert.equal(matchedKeys.length, 1, 'REGISTRY_PINNED_KEY_NOT_FOUND');
  const key = matchedKeys[0];
  assert.equal(key.keytype, 'ecdsa-sha2-nistp256', 'REGISTRY_KEY_UNEXPECTED_ALGORITHM');
  assert.equal(key.scheme, 'ecdsa-sha2-nistp256', 'REGISTRY_KEY_UNEXPECTED_SCHEME');
  if (key.expires !== null) {
    assert.ok(typeof key.expires === 'string' &&
      Date.parse(key.expires) > Date.now(), 'REGISTRY_SIGNING_KEY_EXPIRED');
  }
  const publicDER = exactBase64(key.key);
  assert.equal(createHash('sha256').update(publicDER).digest('base64'),
    pin.spkiSha256Base64, 'REGISTRY_KEY_PUBLIC_SPKI_PIN_MISMATCH');
  const publicKey = createPublicKey({ key: publicDER, format: 'der', type: 'spki' });
  assert.equal(publicKey.asymmetricKeyType, 'ec', 'REGISTRY_KEY_NOT_EC');
  assert.equal(publicKey.asymmetricKeyDetails?.namedCurve, 'prime256v1',
    'REGISTRY_KEY_NOT_P256');
  const signaturesRaw = metadata?.dist?.signatures;
  assert.ok(Array.isArray(signaturesRaw) && signaturesRaw.length > 0,
    'REGISTRY_DIST_SIGNATURES_ABSENT');
  const signatures = signaturesRaw.filter(x => x?.keyid === pin.keyid);
  assert.ok(signatures.length > 0, 'REGISTRY_KEY_ID_MISMATCH');
  assert.equal(signatures.length, 1, 'REGISTRY_DUPLICATE_PINNED_SIGNATURES');
  const signed = Buffer.from(name + '@' + version + ':' + manifest.integrity);
  const signature = exactBase64(signatures[0].sig);
  assert.ok(verifySignature('sha256', signed, publicKey, signature),
    'REGISTRY_ECDSA_SIGNATURE_INVALID');
  return {
    name, version,
    status: 'PASS_PINNED_P256_ECDSA',
    keyid: pin.keyid,
    publicKeyFingerprintPinned: true,
    signedSubjectDigest: sha256(signed),
    signatureDigest: sha256(signature),
    keyTrustSource: pin.anchor,
    rawSignatureOrPublicKeyRetained: false,
    independentOfNpmCliVerification: true,
    sameResponseReplayAcrossNpmVersions: 'UNVERIFIED',
  };
}

async function getPublicJson(url, maxBytes) {
  assert.equal(url.origin, ORIGIN, 'REGISTRY_NETWORK_ORIGIN_UNTRUSTED');
  assert.ok(!url.search && !url.hash && !url.username && !url.password,
    'REGISTRY_NETWORK_URL_WITH_PARAMETERS');
  return new Promise((resolve, reject) => {
    const req = get(url, { timeout: 20000,
      headers: { Accept: 'application/json' } }, response => {
      if (response.statusCode !== 200) {
        response.resume(); reject(new Error('REGISTRY_METADATA_HTTP_NON_200')); return;
      }
      let size = 0; const chunks = [];
      response.on('data', chunk => {
        size += chunk.length;
        if (size > maxBytes) {
          response.destroy(new Error('REGISTRY_METADATA_TOO_LARGE')); return;
        }
        chunks.push(chunk);
      });
      response.on('error', reject);
      response.on('end', () => {
        try {
          const bytes = Buffer.concat(chunks);
          resolve({ parsed: JSON.parse(bytes.toString('utf8')), sha256: sha256(bytes) });
        } catch {
          reject(new Error('REGISTRY_METADATA_MALFORMED_JSON'));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('REGISTRY_METADATA_TIMEOUT')));
  });
}
export async function verifyTargetRegistryPublications(lock, targets,
  fetchJson = getPublicJson, pin = PIN) {
  const keyData = await fetchJson(new URL('/-/npm/v1/keys', ORIGIN), 128 * 1024);
  const reports = [];
  for (const [name, version] of Object.entries(targets)) {
    assert.match(name, /^@babel\/[a-z0-9-]+$/, 'REGISTRY_UNEXPECTED_TARGET_NAMESPACE');
    // npm signs version dist data in the package packument, not necessarily
    // in a single-version metadata endpoint. Read the immutable version entry
    // from npm's standard installation packument; never infer from a dist-tag.
    const path = '/' + encodeURIComponent(name);
    const info = await fetchJson(new URL(path, ORIGIN), 8 * 1024 * 1024);
    assert.equal(info.parsed?.name, name, 'REGISTRY_PACKUMENT_NAME_MISMATCH');
    const signedVersion = info.parsed?.versions?.[version];
    assert.ok(signedVersion, 'REGISTRY_MISSING_EXACT_VERSION_IN_PACKUMENT');
    const record = checkRegistryPublication(signedVersion, keyData.parsed,
      lock, name, version, pin);
    reports.push({ ...record, metadataResponseSha256: info.sha256 });
  }
  assert.equal(reports.length, Object.keys(targets).length, 'REGISTRY_PARTIAL_ECDSA');
  return {
    status: 'PASS_PINNED_REGISTRY_KEY_ECDSA',
    keysetResponseSha256: keyData.sha256,
    evidence: reports,
    capture: 'SEPARATELY_OBSERVED_PUBLIC_HTTP_RESPONSES',
    sameResponseVerifierDifferential: 'UNVERIFIED',
    rawPackumentOrSigningKeysUploaded: false,
  };
}


const SAFE_REGISTRY_ERROR_CATEGORIES = Object.freeze([
  'REGISTRY_METADATA_HTTP_NON_200',
  'REGISTRY_PACKUMENT_NAME_MISMATCH',
  'REGISTRY_MISSING_EXACT_VERSION_IN_PACKUMENT',
  'REGISTRY_METADATA_TOO_LARGE',
  'REGISTRY_METADATA_MALFORMED_JSON',
  'REGISTRY_METADATA_TIMEOUT',
  'REGISTRY_NETWORK_ORIGIN_UNTRUSTED',
  'REGISTRY_NETWORK_URL_WITH_PARAMETERS',
  'REGISTRY_METADATA_NAME_MISMATCH',
  'REGISTRY_METADATA_VERSION_MISMATCH',
  'REGISTRY_METADATA_SRI_MISMATCH',
  'REGISTRY_METADATA_TARBALL_MISMATCH',
  'REGISTRY_PINNED_KEY_NOT_FOUND',
  'REGISTRY_KEY_UNEXPECTED_ALGORITHM',
  'REGISTRY_KEY_UNEXPECTED_SCHEME',
  'REGISTRY_SIGNING_KEY_EXPIRED',
  'REGISTRY_KEY_PUBLIC_SPKI_PIN_MISMATCH',
  'REGISTRY_KEY_NOT_EC',
  'REGISTRY_KEY_NOT_P256',
  'REGISTRY_PINNED_SIGNATURE_NOT_FOUND',
  'REGISTRY_DIST_SIGNATURES_ABSENT',
  'REGISTRY_KEY_ID_MISMATCH',
  'REGISTRY_DUPLICATE_PINNED_SIGNATURES',
  'REGISTRY_ECDSA_SIGNATURE_INVALID',
  'REGISTRY_ORIGIN_UNTRUSTED',
  'REGISTRY_LOCK_SRI_MISSING',
  'REGISTRY_UNEXPECTED_TARGET_NAMESPACE',
  'MISSING_EXACT_LOCKED_TARGET',
  'INCONSISTENT_NESTED_TARGET_SRI',
  'INCONSISTENT_NESTED_TARGET_URL',
  'INVALID_SIGNATURE_OR_KEY_ENCODING',
  'NONCANONICAL_SIGNATURE_OR_KEY_ENCODING',
]);
export function classifyRegistryProofFailure(error) {
  const message = String(error?.message || '');
  return SAFE_REGISTRY_ERROR_CATEGORIES.find(code =>
    message === code || message.startsWith(code + '_') || message.startsWith(code + ':'))
    || 'UNVERIFIED_REGISTRY_PROOF_FAILURE';
}


// Source file/line and error class only, never a raw error message or stack.
export function safeRegistryFailureLocation(error) {
  const kind = ['TypeError', 'RangeError', 'SyntaxError', 'AssertionError',
    'Error'].includes(error?.name) ? error.name : 'UNVERIFIED';
  const allowedCodes = ['ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET', 'ETIMEDOUT',
    'ERR_ASSERTION', 'ERR_INVALID_ARG_TYPE', 'ERR_INVALID_URL',
    'ERR_OSSL_EVP_UNSUPPORTED', 'ERR_OSSL_ASN1_WRONG_TAG'];
  const code = allowedCodes.includes(error?.code) ? error.code : 'UNVERIFIED';
  const match = /npm-sigstore-(registry|proof)\.mjs:(\d+):(\d+)/.exec(String(error?.stack || ''));
  const line = match ? Number(match[2]) : null;
  return {
    kind, code,
    sourceFile: match ? 'npm-sigstore-' + match[1] + '.mjs' : 'UNVERIFIED',
    sourceLine: Number.isSafeInteger(line) && line > 0 && line < 1000 ? line : null,
    messageOrStackRetained: false,
  };
}
