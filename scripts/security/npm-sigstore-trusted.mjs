// Issue #71: independent-from-registry-bundle Sigstore TUF / Fulcio / OIDC / Rekor gate.
// DO NOT interpret success as proof of the historical intermittent npm10 root cause.
// Uses the reviewed npm11-bundled sigstore 4.1.1 verifier (patched @sigstore/verify 3.1.1).
// Authenticated TUF bootstrap is bundled in that verifier; an out-of-band Tio-Money
// root-key pin is NOT established by this diagnostic.
import assert from 'node:assert/strict';
import { createHash, X509Certificate } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join } from 'node:path';
import { downloadRegistryAttestations, downloadRegistryTarball, verifySignedSubject,
  selectVerifiedLockedTarget } from './npm-sigstore-proof.mjs';

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


// Observe only public identity fields from a signed, already Sigstore-verified
// SLSA sample. This is NOT a policy allowlist or a trusted publisher approval.
// Unexpected certificates/paths are sanitized to fixed UNVERIFIED categories.
const SAFE_REF = /^refs\/(?:heads|tags)\/[A-Za-z0-9._/-]{1,120}$/;
const SAFE_CERT_SAN = /^URI:(https:\/\/github\.com\/babel\/babel\/\.github\/workflows\/release\.yml@(refs\/(?:heads|tags)\/[A-Za-z0-9._/-]{1,120}))$/;
const SAFE_INVOCATION = /^https:\/\/github\.com\/babel\/babel\/actions\/runs\/[1-9][0-9]{0,19}\/attempts\/[1-9][0-9]{0,6}$/;
const COMMIT_SHA = /^[0-9a-f]{40}$/;
const safeRef = value => typeof value === 'string' && SAFE_REF.test(value) &&
  value.split('/').every(segment => segment !== '.' && segment !== '..');

export function observeVerifiedPublisherSource(subjectAltName, statement) {
  const output = {
    exactReleaseWorkflowSanStatus: 'UNVERIFIED',
    signedSlsaWorkflowStatus: 'UNVERIFIED',
    signedSourceCommitStatus: 'UNVERIFIED',
    signedRunIdentityStatus: 'UNVERIFIED',
    refAgreement: 'UNVERIFIED',
    npmRegisteredTrustedPublisher: 'UNVERIFIED',
    sourceCommitMatchesOfficialReleaseTree: 'UNVERIFIED',
    rootBootstrapSeparatelyApproved: false,
  };
  // SubjectAltName comes from a leaf already validated by pinned Sigstore
  // verifier; never echo arbitrary SAN content or raw X.509 material.
  const uris = typeof subjectAltName === 'string' && subjectAltName.length < 1500
    ? subjectAltName.split(/,\s*/).filter(value => value.startsWith('URI:'))
    : [];
  const match = uris.length === 1 ? SAFE_CERT_SAN.exec(uris[0]) : null;
  if (match && safeRef(match[2])) {
    output.exactReleaseWorkflowSanStatus = 'OBSERVED_IN_VERIFIED_CERT_SAMPLE';
    output.releaseWorkflowSan = match[1];
  }
  const def = statement?.predicate?.buildDefinition;
  const workflow = def?.externalParameters?.workflow;
  const ref = workflow?.ref;
  if (workflow?.repository === 'https://github.com/babel/babel' &&
      workflow?.path === '.github/workflows/release.yml' && safeRef(ref)) {
    output.signedSlsaWorkflowStatus = 'OBSERVED_IN_SIGNED_SAMPLE';
    output.signedSlsaWorkflowRef = ref;
    if (match && safeRef(match[2])) {
      output.refAgreement = match[2] === ref ? 'MATCH' : 'MISMATCH';
    }
    const dep = Array.isArray(def?.resolvedDependencies)
      ? def.resolvedDependencies.filter(item =>
        item?.uri === 'git+https://github.com/babel/babel@' + ref &&
        COMMIT_SHA.test(item?.digest?.gitCommit || '')) : [];
    if (dep.length === 1) {
      output.signedSourceCommitStatus = 'OBSERVED_IN_SIGNED_SAMPLE';
      output.signedSourceCommit = dep[0].digest.gitCommit;
    }
  }
  const invocation = statement?.predicate?.runDetails?.metadata?.invocationId;
  if (typeof invocation === 'string' && SAFE_INVOCATION.test(invocation)) {
    output.signedRunIdentityStatus = 'OBSERVED_IN_SIGNED_SAMPLE';
    output.signedReleaseRunUri = invocation;
  }
  return output;
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
    const { manifest: pkg, entry } = selectVerifiedLockedTarget(verified, lock, name, version);
    assert.equal(new URL(pkg.resolved).origin, REGISTRY, 'TRUST_TARBALL_REGISTRY_MISMATCH');
    assert.match(pkg.integrity || '', /^sha512-[A-Za-z0-9+/=]+$/,
      'TRUST_LOCK_SRI_MISSING_' + name);
    const tarball = await fetchTarball(pkg.resolved);
    assert.ok(Buffer.isBuffer(tarball) && tarball.length > 0 &&
      tarball.length <= 16 * 1024 * 1024, 'TRUST_INVALID_TARBALL_BYTES_' + name);
    assert.ok(createHash('sha512').update(tarball).digest().equals(
      Buffer.from(pkg.integrity.slice(7), 'base64')), 'TRUST_LOCK_SRI_MISMATCH_' + name);
    const attestationURL = entry?.attestations?.url;
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
    let subjectAltName = '';
    try {
      const publicCert = bundle.verificationMaterial?.certificate?.rawBytes ||
        bundle.verificationMaterial?.x509CertificateChain?.certificates?.[0]?.rawBytes;
      // Never expose raw or invalid certificate input; report UNVERIFIED instead.
      if (typeof publicCert === 'string' && publicCert.length > 0 &&
          publicCert.length <= 24000) {
        subjectAltName = new X509Certificate(
          Buffer.from(publicCert, 'base64')).subjectAltName || '';
      }
    } catch {
      subjectAltName = '';
    }
    const observedPublisherSource = observeVerifiedPublisherSource(
      subjectAltName, statement);
    reports.push({
      name, version,
      observedPublisherSource,
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
