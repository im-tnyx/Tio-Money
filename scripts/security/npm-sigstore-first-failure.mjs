// Issue #71: first-Failed npm audit signatures evidence, never retry until green.
// Capture ONLY reviewed lockfile identities and public-response SHA256 fingerprints.
// Do not claim a later independent HTTP GET is the original npm HTTP response.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { get } from 'node:https';
import { identifyInvalidPackages } from './npm-sigstore-metadata.mjs';

const ORIGIN = 'https://registry.npmjs.org';
const MAX_TARGETS = 3;
const MAX_HTTP_BYTES = 8 * 1024 * 1024;
const MAX_NPM_OUTPUT_BYTES = 6 * 1024 * 1024;
const VERSION = /^\d+\.\d+\.\d+$/;
const SAFE_DIGEST = /^[0-9a-f]{64}$/;

function digest(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}
function boundedOutput(value) {
  const bytes = Buffer.from(typeof value === 'string' ? value : '', 'utf8');
  return bytes.length <= MAX_NPM_OUTPUT_BYTES
    ? { sha256: digest(bytes), bytes: bytes.length, complete: true }
    : { sha256: null, bytes: null, complete: false };
}
function allowedLockedId(id, lock) {
  if (typeof id !== 'string' || id.length > 170) return false;
  const at = id.lastIndexOf('@');
  if (at < 1) return false;
  const name = id.slice(0, at), version = id.slice(at + 1);
  if (!/^@babel\/[a-z0-9-]+$/.test(name) || !VERSION.test(version)) return false;
  return Object.entries(lock?.packages || {}).some(([path, entry]) =>
    (path === 'node_modules/' + name ||
      path.endsWith('/node_modules/' + name)) && entry?.version === version);
}

export function firstFailureFingerprint({ stdout, stderr, exitStatus, signal,
  npmVersion, lock, lockBytes, verifierVersions = { status: 'UNVERIFIED' } }) {
  assert.ok(lock?.packages && Buffer.isBuffer(lockBytes),
    'FIRST_FAILURE_COMMITTED_LOCK_REQUIRED');
  const recognized = identifyInvalidPackages(
    String(stdout || '') + '\n' + String(stderr || ''), lock);
  const reportedInvalidPackageIds = recognized.reportedInvalidPackageIds
    .filter(id => allowedLockedId(id, lock)).slice(0, MAX_TARGETS);
  const version = VERSION.test(npmVersion || '') ? npmVersion : 'UNVERIFIED';
  const safeVersions = {};
  for (const key of ['sigstore', 'sigstoreVerify', 'sigstoreTuf']) {
    const v = verifierVersions?.[key];
    safeVersions[key] = VERSION.test(v || '') ? v : 'UNVERIFIED';
  }
  const stdoutDigest = boundedOutput(stdout);
  const stderrDigest = boundedOutput(stderr);
  return {
    gate: 'NPM_AUDIT_SIGNATURES_FIRST_FAILURE',
    firstAttemptResult: 'FAILED_NO_RETRY_OR_WAIVER',
    processStatus: exitStatus === null ? 'NO_EXIT_CODE' :
      Number.isSafeInteger(exitStatus) && exitStatus > 0 ? 'NONZERO_EXIT' :
        exitStatus === 0 ? 'ZERO_WITH_SIGNAL_OR_ERROR' : 'UNVERIFIED',
    abnormalSignal: signal ? 'SIGNALLED' : 'NONE',
    npmVersion: version,
    verifierVersions: safeVersions,
    lockSha256: digest(lockBytes),
    originalNpmStdoutSha256: stdoutDigest.sha256,
    originalNpmStderrSha256: stderrDigest.sha256,
    originalCliOutputHashComplete: stdoutDigest.complete && stderrDigest.complete,
    recognizedInvalidAttestationCount: recognized.invalidAttestationCount,
    reportedInvalidPackageIds,
    npmErrorCodes: recognized.npmErrorCodes,
    packageIdentityStatus: reportedInvalidPackageIds.length > 0
      ? 'EXACT_COMMITTED_LOCKFILE_ID' : 'UNVERIFIED',
    identityTruncated: recognized.reportedInvalidPackageIds.length > MAX_TARGETS,
    originalRegistryHttpResponseSha256: 'NOT_CAPTURED_BY_NPM_CLI',
    laterHttpSampleIsOriginalResponse: false,
    firstFailureBlocksCi: true,
    rawCliOutputOrSecretsRetained: false,
  };
}

export async function hashPublicRegistryResponse(url, maxBytes = MAX_HTTP_BYTES) {
  assert.ok(url instanceof URL && url.origin === ORIGIN &&
    !url.username && !url.password && !url.search && !url.hash,
  'FIRST_FAILURE_PUBLIC_REGISTRY_ONLY');
  assert.ok(url.pathname === '/-/npm/v1/keys' ||
    url.pathname.startsWith('/-/npm/v1/attestations/') ||
    /^\/%40babel%2F[a-z0-9-]+$/.test(url.pathname),
  'FIRST_FAILURE_UNREVIEWED_PATH');
  assert.ok(Number.isSafeInteger(maxBytes) && maxBytes <= MAX_HTTP_BYTES &&
    maxBytes > 0, 'FIRST_FAILURE_INVALID_MAX_BYTES');
  return new Promise(resolve => {
    let settled = false;
    const done = result => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const req = get(url, { timeout: 6000, headers: {
      Accept: 'application/json',
    } }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        done({ status: 'UNAVAILABLE_HTTP_NON_200', sha256: null });
        return;
      }
      const hash = createHash('sha256');
      let length = 0;
      res.on('data', chunk => {
        length += chunk.length;
        if (length > maxBytes) {
          res.destroy();
          done({ status: 'UNAVAILABLE_SIZE_LIMIT', sha256: null });
          return;
        }
        hash.update(chunk);
      });
      res.on('end', () => done({
        status: 'SAMPLED_AFTER_FAILURE', sha256: hash.digest('hex'), bytes: length,
      }));
      res.on('error', () => done({
        status: 'UNAVAILABLE_TRANSPORT', sha256: null,
      }));
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => done({
      status: 'UNAVAILABLE_TRANSPORT', sha256: null,
    }));
  });
}

function safeSnapshot(result) {
  if (!result || result.status !== 'SAMPLED_AFTER_FAILURE' ||
    !SAFE_DIGEST.test(result.sha256 || '') ||
    !Number.isSafeInteger(result.bytes) || result.bytes < 0 ||
    result.bytes > MAX_HTTP_BYTES) {
    return { status: 'UNVERIFIED', sha256: null };
  }
  return { status: 'SAMPLED_AFTER_FAILURE', sha256: result.sha256,
    bytes: result.bytes };
}

export async function samplePostFailurePublicRegistry(fingerprint, lock,
  fetchHash = hashPublicRegistryResponse) {
  assert.equal(fingerprint?.firstAttemptResult, 'FAILED_NO_RETRY_OR_WAIVER',
    'FIRST_FAILURE_OBSERVATION_REQUIRES_FAILURE');
  const result = {
    timing: 'AFTER_FIRST_NPM_CLI_FAILURE',
    originalNpmHttpResponseReplayed: false,
    noRetryOfAuditSignatures: true,
    registryKeyset: { status: 'UNVERIFIED', sha256: null },
    packageMetadata: [],
    rawHttpBytesPersistedOrUploaded: false,
  };
  // Exactly one post-failure read-only HTTP attempt per allowlisted resource.
  const keys = new URL('/-/npm/v1/keys', ORIGIN);
  try { result.registryKeyset = safeSnapshot(await fetchHash(keys, 128 * 1024)); }
  catch { /* no raw error output, npm failure remains blocking */ }
  for (const id of (fingerprint.reportedInvalidPackageIds || []).slice(0, MAX_TARGETS)) {
    if (!allowedLockedId(id, lock)) continue;
    const at = id.lastIndexOf('@'), name = id.slice(0, at),
      version = id.slice(at + 1);
    const base = {
      packageId: id,
      attestations: { status: 'UNVERIFIED', sha256: null },
      packument: { status: 'UNVERIFIED', sha256: null },
    };
    const attest = new URL('/-/npm/v1/attestations/' +
      encodeURIComponent(name) + '@' + version, ORIGIN);
    const pack = new URL('/' + encodeURIComponent(name), ORIGIN);
    try { base.attestations = safeSnapshot(await fetchHash(attest, MAX_HTTP_BYTES)); }
    catch { /* NO_RETRY */ }
    try { base.packument = safeSnapshot(await fetchHash(pack, MAX_HTTP_BYTES)); }
    catch { /* NO_RETRY */ }
    result.packageMetadata.push(base);
  }
  return result;
}
