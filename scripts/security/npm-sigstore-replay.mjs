// Issue #71: compare npm10 and npm11 Sigstore verifiers over ONE sampled public
// attestation response per exact locked Babel package on a single isolated host.
// This is NOT an npm CLI offline replay or a historical invalid-response capture.
// No packages are installed, no secrets used, no raw bundles/certificates logged.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AFFECTED, gitBlobSha1, verifyLock } from './npm-sigstore-diagnostic.mjs';
import { downloadRegistryAttestations, downloadRegistryTarball,
  selectLockedTarget, verifySignedSubject } from './npm-sigstore-proof.mjs';
import { verifierVersions } from './npm-sigstore-metadata.mjs';
import { trustedVerificationOptions } from './npm-sigstore-trusted.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCKFILE = join(ROOT, '.github/preview-eas-cli/package-lock.json');
const EXPECTED_LOCK_BLOB = 'fa92a2b84071c5cb974becffd6ac74dabf050989';
export const PINNED = Object.freeze({
  npm10: { sigstore: '3.0.0', sigstoreVerify: '2.0.0', sigstoreTuf: '3.0.0' },
  npm11: { sigstore: '4.1.1', sigstoreVerify: '3.1.1', sigstoreTuf: '4.0.2' },
});

export function verifyReplayToolchainVersions(versions, expected) {
  for (const [key, version] of Object.entries(expected)) {
    assert.equal(versions?.[key], version, 'REPLAY_UNREVIEWED_TOOLCHAIN_VERSION_' + key);
  }
}

export function compareOneCapturedBundle(bundle, verify10, verify11, opts10, opts11) {
  assert.ok(bundle?.dsseEnvelope?.payload, 'REPLAY_SIGNED_DSSE_MISSING');
  assert.equal(typeof verify10, 'function', 'REPLAY_NPM10_VERIFIER_MISSING');
  assert.equal(typeof verify11, 'function', 'REPLAY_NPM11_VERIFIER_MISSING');
  const json = JSON.stringify(bundle);
  assert.ok(Buffer.byteLength(json, 'utf8') > 0 &&
    Buffer.byteLength(json, 'utf8') < 8 * 1024 * 1024, 'REPLAY_BUNDLE_SIZE_INVALID');
  const digest = createHash('sha256').update(json).digest('hex');
  const parsedA = JSON.parse(json);
  const parsedB = JSON.parse(json);
  assert.equal(createHash('sha256').update(JSON.stringify(parsedA)).digest('hex'),
    digest, 'REPLAY_NPM10_DIFFERENT_CAPTURE');
  assert.equal(createHash('sha256').update(JSON.stringify(parsedB)).digest('hex'),
    digest, 'REPLAY_NPM11_DIFFERENT_CAPTURE');
  return { payloadSha256: digest, copies: [parsedA, parsedB],
    verifyBoth: async () => {
      const statuses = [];
      // Evaluate both verifiers even if one fails; never leak library errors.
      for (const [client, parsed, opts] of [
        [verify10, parsedA, opts10], [verify11, parsedB, opts11]]) {
        try { await client(parsed, undefined, opts); statuses.push('PASS'); }
        catch { statuses.push('REJECTED'); }
      }
      return { npm10Sigstore: statuses[0], npm11Sigstore: statuses[1],
        sameCapturedBundleSha256: digest,
        bytesSharedAcrossVerifiers: true, rawBundleRetained: false };
    },
  };
}

export function loadReviewedSigstore(globalRoot, expected) {
  assert.ok(isAbsolute(globalRoot) && globalRoot.length < 500,
    'REPLAY_GLOBAL_ROOT_INVALID');
  verifyReplayToolchainVersions(verifierVersions(globalRoot), expected);
  const npmPath = join(globalRoot, 'npm', 'package.json');
  const pkg = JSON.parse(readFileSync(join(globalRoot, 'npm', 'node_modules',
    'sigstore', 'package.json'), 'utf8'));
  assert.equal(pkg.version, expected.sigstore, 'REPLAY_SIGSTORE_MANIFEST_MISMATCH');
  const lib = createRequire(npmPath)('sigstore');
  assert.equal(typeof lib.verify, 'function', 'REPLAY_SIGSTORE_VERIFY_MISSING');
  return lib.verify;
}

export async function compareCapturedTargets(lock, targets, verify10, verify11, tmp,
  fetchAttestations = downloadRegistryAttestations,
  fetchTarball = downloadRegistryTarball) {
  assert.ok(isAbsolute(tmp), 'REPLAY_PRIVATE_TUF_CACHE_MISSING');
  const opts10 = trustedVerificationOptions(join(tmp, 'tuf10'));
  const opts11 = trustedVerificationOptions(join(tmp, 'tuf11'));
  const reports = [];
  for (const [name, version] of Object.entries(targets)) {
    assert.match(name, /^@babel\/[a-z0-9-]+$/, 'REPLAY_UNAPPROVED_PACKAGE');
    const { manifest, copies } = selectLockedTarget(lock, name, version);
    const bytes = await fetchTarball(manifest.resolved);
    assert.ok(Buffer.isBuffer(bytes) && bytes.length > 0 &&
      bytes.length <= 16 * 1024 * 1024, 'REPLAY_TARBALL_INVALID');
    assert.ok(createHash('sha512').update(bytes).digest().equals(
      Buffer.from(manifest.integrity.slice(7), 'base64')),
      'REPLAY_COMMITTED_SRI_MISMATCH');
    const url = 'https://registry.npmjs.org/-/npm/v1/attestations/' +
      encodeURIComponent(name) + '@' + encodeURIComponent(version);
    // ONE HTTPS request for the raw package attestation JSON on this runner.
    const document = await fetchAttestations(url, name, version);
    const records = (document?.attestations || []).filter(record =>
      record?.predicateType?.startsWith('https://slsa.dev/provenance/') &&
      !!(record?.bundle?.verificationMaterial?.certificate?.rawBytes ||
        record?.bundle?.verificationMaterial?.x509CertificateChain?.certificates?.[0]?.rawBytes));
    assert.equal(records.length, 1, 'REPLAY_PROVENANCE_BUNDLE_AMBIGUOUS_' + name);
    const bundle = records[0].bundle;
    assert.ok(bundle?.verificationMaterial?.tlogEntries?.some(z =>
      z?.inclusionPromise?.signedEntryTimestamp), 'REPLAY_REKOR_PROMISE_MISSING');
    const statement = JSON.parse(Buffer.from(bundle.dsseEnvelope.payload,
      'base64').toString('utf8'));
    verifySignedSubject(statement, name, version, bytes);
    const replay = compareOneCapturedBundle(bundle, verify10, verify11,
      opts10, opts11);
    const result = await replay.verifyBoth();
    reports.push({ name, version, lockedCopies: copies,
      tarballSri: 'PASS', signedSubject: 'PASS',
      ...result });
  }
  assert.equal(reports.length, Object.keys(targets).length,
    'REPLAY_PARTIAL_TARGET_COVERAGE');
  return { status: reports.every(x => x.npm10Sigstore === 'PASS' &&
    x.npm11Sigstore === 'PASS') ? 'BOTH_PASS_SAMPLED_BUNDLES' : 'VERIFIER_DIVERGENCE_OR_REJECTION',
  npm10Sigstore: '3.0.0', npm11Sigstore: '4.1.1',
  captureBoundary: 'SAME_PARSED_PUBLIC_BUNDLE_SAME_JOB_TWO_VERIFIERS',
  actualNpmAuditCliOfflineReplay: 'NOT_PERFORMED',
  historicalFailedRegistryResponseReplay: 'UNAVAILABLE_NOT_CAPTURED',
  historicalRootCause: 'UNVERIFIED',
  independentlyOwnerApprovedTufBootstrap: 'UNVERIFIED',
  rawNetworkDataStoredOrUploaded: false,
  results: reports };
}

export async function main() {
  let temp;
  let status = 'FAIL_CLOSED';
  let detail = 'REPLAY_NOT_PERFORMED';
  try {
    const bytes = readFileSync(LOCKFILE);
    assert.equal(gitBlobSha1(bytes), EXPECTED_LOCK_BLOB, 'REPLAY_LOCK_BLOB_CHANGED');
    const lock = JSON.parse(bytes.toString('utf8'));
    verifyLock(lock, bytes);
    temp = mkdtempSync(join(tmpdir(), 'tio-same-response-'));
    const verify10 = loadReviewedSigstore(process.env.NPM10_GLOBAL_ROOT || '', PINNED.npm10);
    const verify11 = loadReviewedSigstore(process.env.NPM11_GLOBAL_ROOT || '', PINNED.npm11);
    const outcome = await compareCapturedTargets(lock, AFFECTED, verify10, verify11, temp);
    status = outcome.status;
    detail = outcome;
    if (status !== 'BOTH_PASS_SAMPLED_BUNDLES') process.exitCode = 1;
  } catch {
    detail = 'REPLAY_FAILED_CLOSED_UNVERIFIED_CAUSE';
    process.exitCode = 1;
  } finally {
    if (temp) rmSync(temp, { recursive: true, force: true });
    const safe = JSON.stringify({ task: 'TM-SEC-SIGSTORE-20261122-001',
      exactLockedPackages: Object.keys(AFFECTED).length,
      outcome: status, data: detail, noRawBundlesOrCredentials: true }, null, 2);
    console.log(safe);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
