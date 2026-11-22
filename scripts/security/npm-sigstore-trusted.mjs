// Issue #71: independent-from-registry-bundle Sigstore TUF / Fulcio / OIDC / Rekor gate.
// DO NOT interpret success as proof of the historical intermittent npm10 root cause.
// Uses the reviewed npm11-bundled sigstore 4.1.1 verifier (patched @sigstore/verify 3.1.1).
// Authenticated TUF bootstrap is bundled in that verifier; an out-of-band Tio-Money
// root-key pin is NOT established by this diagnostic.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join } from 'node:path';
import { downloadRegistryAttestations, downloadRegistryTarball, verifySignedSubject,
  selectLockedTarget } from './npm-sigstore-proof.mjs';

const REGISTRY = 'https://registry.npmjs.org';
const EXPECTED_ISSUER = 'https://token.actions.githubusercontent.com';
// Source repository is independently grounded in Babel package/release metadata.
// A single repository workflow identity is required; generic GitHub issuers are NOT enough.
// This is repository-scoped, not a pinned exact publisher workflow or commit identity.
const BABEL_WORKFLOW_URI = String.raw`^https://github\.com/babel/babel/\.github/workflows/[A-Za-z0-9_.-]+\.ya?ml@refs/(?:tags|heads)/[A-Za-z0-9._/-]+$`;
const VERSION = Object.freeze({
  sigstore: '4.1.1',
  sigstoreVerify: '3.1.1',
  sigstoreTuf: '4.0.2',
});

export function enforcePinnedVerifier(versions) {
  for (const [name, version] of Object.entries(VERSION)) {
    assert.equal(versions?.[name], version, 'TRUST_VERIFIER_VERSION_UNREVIEWED_' + name);
  }
}

export function trustedVerificationOptions(tufCachePath) {
  assert.ok(typeof tufCachePath === 'string' && isAbsolute(tufCachePath),
    'PRIVATE_TUF_CACHE_PATH_REQUIRED');
  return Object.freeze({
    certificateIssuer: EXPECTED_ISSUER,
    certificateIdentityURI: BABEL_WORKFLOW_URI,
    ctlogThreshold: 1,
    tlogThreshold: 1,
    tufCachePath,
    tufForceCache: false,
  });
}

// Only a stable, patched npm-bundled Sigstore can supply this verifier. No npx,
// implicit version upgrade, user-specific npmrc, or remotely fetched verification script.
export function loadPinnedVerifier(npmGlobalRoot, versions) {
  enforcePinnedVerifier(versions);
  const manifestPath = join(npmGlobalRoot, 'npm', 'node_modules', 'sigstore', 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, VERSION.sigstore, 'TRUST_VERIFIER_MANIFEST_CHANGED');
  const requireFromNpm = createRequire(join(npmGlobalRoot, 'npm', 'package.json'));
  const client = requireFromNpm('sigstore');
  assert.equal(typeof client.verify, 'function', 'TRUST_VERIFIER_API_UNAVAILABLE');
  return client.verify;
}

export async function verifyTrustedTargetProvenance(verified, lock, targets,
  verifyBundle, tufCachePath, fetchTarball = downloadRegistryTarball,
  fetchAttestations = downloadRegistryAttestations) {
  assert.ok(Array.isArray(verified), 'TRUST_NPM_VERIFIED_LIST_REQUIRED');
  assert.equal(typeof verifyBundle, 'function', 'TRUST_VERIFIER_UNAVAILABLE');
  const options = trustedVerificationOptions(tufCachePath);
  const reports = [];
  for (const [name, version] of Object.entries(targets)) {
    assert.match(name, /^@babel\/[a-z0-9-]+$/, 'TRUST_UNAPPROVED_PACKAGE_NAMESPACE');
    assert.match(version, /^\d+\.\d+\.\d+$/, 'TRUST_UNAPPROVED_PACKAGE_VERSION');
    const entries = verified.filter(x => x?.name === name && x?.version === version);
    assert.equal(entries.length, 1, 'TRUST_AMBIGUOUS_NPM_VERIFIED_PACKAGE_' + name);
    const { manifest: pkg } = selectLockedTarget(lock, name, version);
    assert.equal(new URL(pkg.resolved).origin, REGISTRY, 'TRUST_TARBALL_REGISTRY_MISMATCH');
    assert.match(pkg.integrity || '', /^sha512-[A-Za-z0-9+/=]+$/,
      'TRUST_LOCK_SRI_MISSING_' + name);
    const tarball = await fetchTarball(pkg.resolved);
    assert.ok(Buffer.isBuffer(tarball) && tarball.length > 0 &&
      tarball.length <= 16 * 1024 * 1024, 'TRUST_INVALID_TARBALL_BYTES_' + name);
    assert.ok(createHash('sha512').update(tarball).digest().equals(
      Buffer.from(pkg.integrity.slice(7), 'base64')), 'TRUST_LOCK_SRI_MISMATCH_' + name);
    const attestationURL = entries[0]?.attestations?.url;
    assert.ok(attestationURL, 'TRUST_MISSING_ATTESTATION_URL_' + name);
    // Existing fetch enforces exact npm origin, public attestation path and package ID.
    const document = await fetchAttestations(attestationURL, name, version);
    const provenance = (document?.attestations || []).filter(record =>
      record?.predicateType?.startsWith('https://slsa.dev/provenance/') &&
      !!(record?.bundle?.verificationMaterial?.certificate?.rawBytes ||
        record?.bundle?.verificationMaterial?.x509CertificateChain?.certificates?.[0]?.rawBytes));
    assert.equal(provenance.length, 1, 'TRUST_MISSING_OR_AMBIGUOUS_SLSA_PROVENANCE_' + name);
    const bundle = provenance[0].bundle;
    const envelope = bundle?.dsseEnvelope;
    assert.ok(envelope?.payload && envelope?.signatures?.length,
      'TRUST_MISSING_SIGNED_DSSE_' + name);
    assert.ok(bundle?.verificationMaterial?.tlogEntries?.some(entry =>
      !!entry?.inclusionPromise?.signedEntryTimestamp),
      'TRUST_MISSING_SIGNED_REKOR_TIMESTAMP_' + name);
    let statement;
    try {
      statement = JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8'));
    } catch {
      throw new Error('TRUST_INVALID_SIGNED_STATEMENT_' + name);
    }
    verifySignedSubject(statement, name, version, tarball);
    // Sigstore uses a TUF-authenticated trusted root, verifies Fulcio certificate
    // and CT evidence, issuer + SAN identity, and Rekor signed-entry evidence.
    // Never use an embedded leaf or self-provided public key as the trust anchor.
    try {
      await verifyBundle(bundle, undefined, options);
    } catch {
      // Sigstore error strings may contain URLs, raw bundle fields or untrusted text.
      throw new Error('TRUSTED_PROVENANCE_CRYPTO_OR_IDENTITY_REJECTED_' + name);
    }
    reports.push({
      name, version,
      committedSri: 'PASS',
      signedSubjectDigest: 'PASS',
      sigstoreTufFulcioCtOidcRekor: 'PASS_BY_PINNED_SIGSTORE_VERIFIER',
      signerPolicy: 'BABEL_REPOSITORY_WORKFLOW_URI_AND_GITHUB_OIDC',
      independentOutOfBandTufRootPin: 'UNVERIFIED',
      independentRegistryPublishKeySignature: 'UNVERIFIED',
      bundleContentRetained: false,
    });
  }
  assert.equal(reports.length, Object.keys(targets).length, 'TRUST_PARTIAL_PACKAGE_PROOFS');
  return reports;
}
