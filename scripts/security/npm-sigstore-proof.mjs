// Issue #71: independent subject/tarball and embedded-leaf DSSE checks.
// This does NOT independently establish Fulcio trust or Rekor inclusion.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash, verify as verifySignature, X509Certificate } from 'node:crypto';
import { get } from 'node:https';

const REGISTRY = 'https://registry.npmjs.org';
const MAX_TARBALL = 16 * 1024 * 1024;
const MAX_STATEMENT = 1024 * 1024;

export function dssePae(envelope) {
  const type = Buffer.from(envelope?.payloadType || '', 'utf8');
  const payload = Buffer.from(envelope?.payload || '', 'base64');
  assert.ok(type.length > 0 && payload.length > 0 && payload.length <= MAX_STATEMENT,
    'INVALID_DSSE_PAYLOAD');
  return Buffer.concat([
    Buffer.from('DSSEv1 ' + type.length + ' '),
    type,
    Buffer.from(' ' + payload.length + ' '),
    payload,
  ]);
}

export function verifyDsseWithPublicKey(envelope, publicKey) {
  const pae = dssePae(envelope);
  assert.ok(Array.isArray(envelope.signatures) && envelope.signatures.length > 0,
    'MISSING_DSSE_SIGNATURE');
  const algorithm = publicKey.asymmetricKeyType === 'ed25519' ? null : 'sha256';
  return envelope.signatures.some((item) => {
    const sig = Buffer.from(item?.sig || '', 'base64');
    return sig.length > 0 && verifySignature(algorithm, pae, publicKey, sig);
  });
}

export function verifySignedSubject(statement, packageName, version, tarball) {
  assert.ok(Array.isArray(statement?.subject), 'MISSING_SIGNED_SUBJECT');
  const digest512 = createHash('sha512').update(tarball).digest('hex');
  const digest256 = createHash('sha256').update(tarball).digest('hex');
  const names = new Set([
    'pkg:npm/' + packageName + '@' + version,
    'pkg:npm/' + packageName.replace(/^@/, '%40') + '@' + version,
  ]);
  const subjects = statement.subject.filter((item) => names.has(item?.name));
  assert.equal(subjects.length, 1, 'MISSING_OR_AMBIGUOUS_PACKAGE_SUBJECT');
  assert.equal(subjects[0].digest?.sha512?.toLowerCase(), digest512,
    'ATTESTED_SHA512_TARBALL_MISMATCH');
  if (subjects[0].digest?.sha256) {
    assert.equal(subjects[0].digest.sha256.toLowerCase(), digest256,
      'ATTESTED_SHA256_TARBALL_MISMATCH');
  }
  return { sha512: digest512, sha256: digest256 };
}

export async function downloadRegistryTarball(resolved) {
  const url = new URL(resolved);
  assert.equal(url.origin, REGISTRY, 'UNTRUSTED_TARBALL_ORIGIN');
  assert.ok(!url.username && !url.password && !url.search && !url.hash,
    'TARBALL_URL_WITH_EXTRA_PARAMETERS');
  assert.ok(url.pathname.endsWith('.tgz'), 'UNEXPECTED_TARBALL_PATH');
  return new Promise((resolve, reject) => {
    const request = get(url, { timeout: 30000, headers: { Accept: 'application/octet-stream' } },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error('REGISTRY_TARBALL_HTTP_NOT_200'));
          return;
        }
        const chunks = [];
        let bytes = 0;
        response.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes > MAX_TARBALL) {
            response.destroy(new Error('TARBALL_SIZE_LIMIT'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });
    request.on('timeout', () => request.destroy(new Error('REGISTRY_TARBALL_TIMEOUT')));
    request.on('error', reject);
  });
}

// The npm 11 verified-array supplies a URL, not always inline bundles.
// Fetch only the exact package/version attestation document from the public registry.
export async function downloadRegistryAttestations(address, name, version) {
  const url = new URL(address);
  assert.equal(url.origin, REGISTRY, 'UNTRUSTED_ATTESTATION_ORIGIN');
  assert.ok(!url.username && !url.password && !url.search && !url.hash,
    'ATTESTATION_URL_WITH_EXTRA_PARAMETERS');
  const prefix = '/-/npm/v1/attestations/';
  assert.ok(url.pathname.startsWith(prefix), 'UNEXPECTED_ATTESTATION_PATH');
  assert.equal(decodeURIComponent(url.pathname.slice(prefix.length)), name + '@' + version,
    'ATTESTATION_PACKAGE_IDENTITY_MISMATCH');
  return new Promise((resolve, reject) => {
    const request = get(url, { timeout: 30000, headers: { Accept: 'application/json' } },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error('REGISTRY_ATTESTATION_HTTP_NOT_200'));
          return;
        }
        const chunks = [];
        let bytes = 0;
        response.on('data', (chunk) => {
          bytes += chunk.length;
          if (bytes > 8 * 1024 * 1024) {
            response.destroy(new Error('ATTESTATION_RESPONSE_SIZE_LIMIT'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch {
            reject(new Error('INVALID_ATTESTATION_JSON'));
          }
        });
        response.on('error', reject);
      });
    request.on('timeout', () => request.destroy(new Error('REGISTRY_ATTESTATION_TIMEOUT')));
    request.on('error', reject);
  });
}

export async function verifyTargetProofs(verified, lock, targets, fetchTarball = downloadRegistryTarball, fetchAttestations = downloadRegistryAttestations) {
  assert.ok(Array.isArray(verified), 'MISSING_VERIFIED_ATTESTATION_LIST');
  const results = [];
  for (const [name, version] of Object.entries(targets)) {
    const packageEntries = verified.filter((entry) => entry?.name === name &&
      entry?.version === version);
    assert.equal(packageEntries.length, 1, 'MISSING_OR_AMBIGUOUS_VERIFIED_PACKAGE_' + name);
    const manifest = lock.packages?.['node_modules/' + name];
    assert.equal(manifest?.version, version, 'LOCKED_PACKAGE_IDENTITY_MISMATCH_' + name);
    const tarball = await fetchTarball(manifest.resolved);
    assert.ok(Buffer.isBuffer(tarball), 'TARBALL_BYTES_UNAVAILABLE_' + name);
    assert.ok(tarball.length > 0 && tarball.length <= MAX_TARBALL, 'INVALID_TARBALL_SIZE');
    const sri = Buffer.from(manifest.integrity.slice(7), 'base64');
    assert.ok(sri.equals(createHash('sha512').update(tarball).digest()),
      'REGISTRY_TARBALL_SRI_MISMATCH_' + name);
    let bundles = packageEntries[0].attestations?.bundles;
    if (!Array.isArray(bundles) || bundles.length === 0) {
      const url = packageEntries[0].attestations?.url;
      assert.ok(url, 'MISSING_PACKAGE_ATTESTATION_URL_' + name);
      const document = await fetchAttestations(url, name, version);
      bundles = document?.attestations;
    }
    assert.ok(Array.isArray(bundles) && bundles.length > 0,
      'NO_PACKAGE_SPECIFIC_DSSE_BUNDLE_' + name);
    let signedDigests;
    for (const record of bundles) {
      const bundle = record?.bundle;
      const envelope = bundle?.dsseEnvelope;
      assert.ok(envelope, 'MISSING_DSSE_ENVELOPE_' + name);
      const statement = JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8'));
      signedDigests = verifySignedSubject(statement, name, version, tarball);
      const material = bundle.verificationMaterial;
      const certBytes = material?.certificate?.rawBytes ||
        material?.x509CertificateChain?.certificates?.[0]?.rawBytes;
      assert.ok(certBytes, 'MISSING_SIGNING_CERTIFICATE_' + name);
      const leaf = new X509Certificate(Buffer.from(certBytes, 'base64'));
      assert.ok(verifyDsseWithPublicKey(envelope, leaf.publicKey),
        'DSSE_LEAF_SIGNATURE_INVALID_' + name);
      assert.ok(Array.isArray(material?.tlogEntries) && material.tlogEntries.length > 0,
        'MISSING_TRANSPARENCY_LOG_EVIDENCE_' + name);
    }
    results.push({
      name,
      version,
      bundlesChecked: bundles.length,
      sha512Tarball: signedDigests.sha512,
      sha256Tarball: signedDigests.sha256,
      committedSriMatchesDownloadedTarball: true,
      signedSubjectDigestMatchesTarball: true,
      dsseSignatureVerifiedAgainstEmbeddedLeaf: true,
      certificateChainTrusted: 'UNVERIFIED',
      signerIdentityPolicyVerified: 'UNVERIFIED',
      rekorInclusionCryptographicallyVerified: 'UNVERIFIED',
    });
  }
  return results;
}
