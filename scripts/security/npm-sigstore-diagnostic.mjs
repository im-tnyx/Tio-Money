// TM-SEC-SIGSTORE-20261122-001: no secrets, no raw network output, fail closed.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyTargetProofs } from './npm-sigstore-proof.mjs';
import { verifyTargetRegistryPublications, classifyRegistryProofFailure }
  from './npm-sigstore-registry.mjs';
import { loadPinnedVerifier, verifyTrustedTargetProvenance }
  from './npm-sigstore-trusted.mjs';
import { identifyInvalidPackages, identifyInvalidJsonPackages,
  fetchRegistrySigningKeyMetadata, verifierVersions } from './npm-sigstore-metadata.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = join(ROOT, '.github/preview-eas-cli');
const REGISTRY = 'https://registry.npmjs.org';
const LOCK_BLOB = 'fa92a2b84071c5cb974becffd6ac74dabf050989';
export const AFFECTED = Object.freeze({
  // Exact nested EAS-lockfile version reported by failing Phase 0 run 45018065154.
  '@babel/code-frame': '7.29.7',
  // Additional exact package reported by Phase 0 after PR #70 merged (#71).
  '@babel/helper-compilation-targets': '7.29.13',
  '@babel/generator': '7.29.15',
  '@babel/helper-module-transforms': '7.29.13',
  '@babel/helper-validator-identifier': '7.29.7',
});

export function gitBlobSha1(bytes) {
  return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}

export function verifyLock(lock, bytes, expectedBlob = LOCK_BLOB) {
  assert.equal(gitBlobSha1(bytes), expectedBlob, 'LOCKFILE_IDENTITY_CHANGED');
  assert.equal(lock.packages?.['']?.dependencies?.['eas-cli'], '27.4.1', 'EAS_VERSION_CHANGED');
  return Object.entries(AFFECTED).map(([name, version]) => {
    const copies = Object.entries(lock.packages || {}).filter(([path]) =>
      path === 'node_modules/' + name || path.endsWith('/node_modules/' + name));
    assert.ok(copies.length > 0, 'MISSING_LOCKED_PACKAGE_' + name);
    assert.ok(copies.some(([, p]) => p.version === version), 'PACKAGE_VERSION_CHANGED_' + name);
    for (const [, p] of copies) {
      assert.ok(p.resolved?.startsWith(REGISTRY + '/'), 'UNTRUSTED_REGISTRY_' + name);
      assert.match(p.integrity || '', /^sha512-[a-zA-Z0-9+/=]+$/, 'MISSING_SRI_' + name);
    }
    return { name, version, copies: copies.length };
  });
}

export function sanitizeFailure(raw, lock) {
  const value = String(raw || '');
  const found = /([0-9]+)\s+packages?\s+(?:have|has)\s+(?:an?\s+)?invalid attestations?/i.exec(value);
  return {
    invalidAttestationCount: found ? Number(found[1]) : null,
    affectedPackagesMentioned: Object.keys(AFFECTED).filter(n => value.includes(n)),
    categories: ['invalid attestation', 'invalid signature', 'missing signature',
      'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'EINTEGRITY']
      .filter(s => value.toLowerCase().includes(s.toLowerCase())),
    rawOutputRetained: false,
    ...identifyInvalidPackages(raw, lock),
  };
}

export function isIncludeAttestationsSupported(value) {
  return ['false', 'true'].includes(String(value).trim());
}

function execNpm(args, cwd, env, timeout = 240000) {
  return spawnSync('npm', args, { cwd, env, encoding: 'utf8', timeout,
    maxBuffer: 6 * 1024 * 1024 });
}

function safeStatus(result) {
  return result.status === 0 && !result.error && !result.signal ? 'PASS' : 'FAIL';
}

export async function runDiagnostic() {
  const temp = mkdtempSync(join(tmpdir(), 'tio-sigstore-'));
  const name = process.env.DIAGNOSTIC_REPLICA || '';
  const report = {
    task: 'TM-SEC-SIGSTORE-20261122-001',
    replica: /^[a-z0-9-]{1,32}$/.test(name) ? name : 'unspecified',
    timestampUtc: new Date().toISOString(), node: process.version,
    registry: REGISTRY, install: 'NOT_RUN', signatures: 'NOT_RUN',
    jsonAttestations: 'NOT_RUN', packageProofStatus: 'NOT_RUN',
    independentSigstoreVerification: false,
    trustedProvenanceStatus: 'NOT_RUN',
    independentlyVerifiedRegistryPublishSignature: 'NOT_RUN',
    rawAttestationsUploaded: false,
  };
  let failed = false;
  try {
    const manifest = readFileSync(join(SOURCE, 'package.json'));
    const lockBytes = readFileSync(join(SOURCE, 'package-lock.json'));
    report.lockGitBlob = gitBlobSha1(lockBytes);
    report.lockSha256 = createHash('sha256').update(lockBytes).digest('hex');
    report.manifestSha256 = createHash('sha256').update(manifest).digest('hex');
    const lock = JSON.parse(lockBytes.toString('utf8'));
    report.packages = verifyLock(lock, lockBytes);
    copyFileSync(join(SOURCE, 'package.json'), join(temp, 'package.json'));
    copyFileSync(join(SOURCE, 'package-lock.json'), join(temp, 'package-lock.json'));
    mkdirSync(join(temp, 'npm-cache'), { mode: 0o700 });
    writeFileSync(join(temp, 'user.npmrc'), '', { mode: 0o600 });
    writeFileSync(join(temp, 'global.npmrc'), '', { mode: 0o600 });
    // No inherited npmrc, NODE_OPTIONS, proxy, EXPO_TOKEN, NODE_AUTH_TOKEN or GITHUB_TOKEN.
    const env = {
      PATH: process.env.PATH || '/usr/bin:/bin', HOME: temp, TMPDIR: temp,
      CI: 'true', LANG: 'C.UTF-8', npm_config_registry: REGISTRY,
      npm_config_userconfig: join(temp, 'user.npmrc'),
      npm_config_globalconfig: join(temp, 'global.npmrc'),
      npm_config_cache: join(temp, 'npm-cache'),
      npm_config_update_notifier: 'false', npm_config_ignore_scripts: 'true',
      npm_config_progress: 'false',
    };
    const version = execNpm(['--version'], temp, env, 15000);
    assert.equal(safeStatus(version), 'PASS', 'NPM_VERSION_UNAVAILABLE');
    assert.match(version.stdout.trim(), /^\d+\.\d+\.\d+$/, 'NPM_VERSION_INVALID');
    report.npm = version.stdout.trim();
    const globalRoot = execNpm(['root', '-g'], temp, env, 15000);
    report.verifierVersions = safeStatus(globalRoot) === 'PASS'
      ? verifierVersions(globalRoot.stdout.trim())
      : { status: 'UNVERIFIED' };
    try {
      report.registrySigningKeys = {
        status: 'AVAILABLE_BUT_NOT_INDEPENDENTLY_TRUSTED',
        keys: await fetchRegistrySigningKeyMetadata(),
      };
    } catch {
      report.registrySigningKeys = { status: 'UNVERIFIED' };
    }
    const install = execNpm(['ci', '--ignore-scripts', '--no-audit', '--no-fund',
      '--prefer-online', '--registry=' + REGISTRY], temp, env, 300000);
    report.install = safeStatus(install);
    if (report.install !== 'PASS') {
      report.failure = { gate: 'NPM_CI', ...sanitizeFailure(install.stdout + '\n' + install.stderr, lock) };
      throw new Error('NPM_CI_FAILED');
    }
    const signatures = execNpm(['audit', 'signatures', '--registry=' + REGISTRY], temp, env);
    report.signatures = safeStatus(signatures);
    if (report.signatures !== 'PASS') {
      report.failure = { gate: 'NPM_AUDIT_SIGNATURES',
        ...sanitizeFailure(signatures.stdout + '\n' + signatures.stderr, lock) };
      // Forensic second observation only; never replace the failed mandatory result.
      const jsonObservation = execNpm(['audit', 'signatures', '--json',
        '--registry=' + REGISTRY], temp, env, 180000);
      report.failureJsonObservation = {
        observation: safeStatus(jsonObservation),
        ...sanitizeFailure(jsonObservation.stdout + '\n' + jsonObservation.stderr, lock),
        jsonInvalidEvidence: identifyInvalidJsonPackages(jsonObservation.stdout, lock),
        firstFailureStillBlocks: true,
      };
      throw new Error('NPM_AUDIT_SIGNATURES_FAILED');
    }
    const support = execNpm(['config', 'get', 'include-attestations'], temp, env, 20000);
    if (support.status === 0 && isIncludeAttestationsSupported(support.stdout)) {
      const detail = execNpm(['audit', 'signatures', '--json', '--include-attestations',
        '--registry=' + REGISTRY], temp, env);
      report.jsonAttestations = safeStatus(detail);
      if (report.jsonAttestations !== 'PASS') {
        report.failure = { gate: 'NPM_JSON_ATTESTATIONS', ...sanitizeFailure(detail.stdout + '\n' + detail.stderr, lock) };
        throw new Error('NPM_JSON_VERIFICATION_FAILED');
      }
      let parsed;
      try { parsed = JSON.parse(detail.stdout); }
      catch { throw new Error('NPM_JSON_PARSE_FAILED'); }
      // npm verifies bundles; metadata only, never output full verified array/DSSE/certs.
      report.verifiedEntries = Array.isArray(parsed?.verified) ? parsed.verified.length : null;
      report.bundleMetadataPresent = Array.isArray(parsed?.verified) &&
        parsed.verified.some(entry => entry && typeof entry === 'object' &&
          ('attestations' in entry || 'bundle' in entry || 'verificationMaterial' in entry));
      // Only allowlisted structural flags: never emit raw per-package bundles.
      report.targetEvidenceShape = Object.entries(AFFECTED).map(([name, version]) => {
        const entries = (parsed.verified || []).filter((item) =>
          item?.name === name && item?.version === version);
        const entry = entries[0];
        const a = entry?.attestations;
        return {
          name, version, matches: entries.length,
          topFields: ['name', 'version', 'attestations', 'bundle', 'provenance',
            'verificationMaterial'].filter((key) => entry && key in entry),
          attestationFields: ['url', 'bundles', 'provenance', 'publish', 'bundle',
            'verificationMaterial'].filter((key) => a && key in a),
          directBundles: Array.isArray(a?.bundles) ? a.bundles.length : null,
          nestedProvenanceBundles: Array.isArray(a?.provenance?.bundles)
            ? a.provenance.bundles.length : null,
          attestationIsArray: Array.isArray(a),
          topLevelBundlePresent: !!entry?.bundle,
        };
      });
      // npm verified the bundle; independently bind each target's signed DSSE
      // subject and embedded-leaf signature to freshly downloaded tarball bytes.
      // A leaf signature alone is NOT Fulcio chain, OIDC identity or Rekor trust.
      try {
        report.packageProofs = await verifyTargetProofs(parsed.verified, lock, AFFECTED);
        report.packageProofStatus = 'SUBJECT_DIGEST_AND_LEAF_SIGNATURE_PASS';
      } catch (proofError) {
        report.packageProofStatus = 'FAIL_CLOSED';
        const categories = [
          'MISSING_OR_AMBIGUOUS_VERIFIED_PACKAGE',
          'NO_PACKAGE_SPECIFIC_DSSE_BUNDLE',
          'MISSING_SIGNING_CERTIFICATE',
          'MISSING_TRANSPARENCY_LOG_EVIDENCE',
          'ATTESTED_SHA512_TARBALL_MISMATCH',
          'REGISTRY_TARBALL_SRI_MISMATCH',
          'DSSE_LEAF_SIGNATURE_INVALID',
          'MISSING_OR_AMBIGUOUS_PACKAGE_SUBJECT',
          'MISSING_FULCIO_PROVENANCE_BUNDLE',
          'UNREVIEWED_PUBLIC_KEY_ATTESTATION',
          'MISSING_REGISTRY_KEY_HINT',
          'UNTRUSTED_TARBALL_ORIGIN',
        ];
        report.packageProofFailure = categories.find((code) =>
          String(proofError.message).startsWith(code)) || 'OTHER_PROOF_ERROR';
        throw new Error('PACKAGE_PROOF_VERIFICATION_FAILED');
      }
      // Next trust gate, npm11 only. This is separate from npm's own verifier.
      // One failed or missing authenticated root/issuer/SAN/Rekor result fails closed.
      // No retries and no raw certificate/registry payloads are retained.
      if (Number(report.npm.split('.')[0]) >= 11) {
        try {
          assert.equal(safeStatus(globalRoot), 'PASS', 'TRUST_GLOBAL_ROOT_UNAVAILABLE');
          const verify = loadPinnedVerifier(globalRoot.stdout.trim(), report.verifierVersions);
          report.trustedProvenanceProofs = await verifyTrustedTargetProvenance(
            parsed.verified, lock, AFFECTED, verify, join(temp, 'sigstore-tuf-cache'));
          report.trustedProvenanceStatus = 'TUF_FULCIO_OIDC_REKOR_PINNED_VERIFIER_PASS';
          report.independentSigstoreVerification = true;
        } catch {
          report.trustedProvenanceStatus = 'FAIL_CLOSED';
          throw new Error('TRUSTED_PROVENANCE_VERIFICATION_FAILED');
        }
        // Registry ECDSA is a SEPARATE gate; do not misclassify this failure
        // as TUF/Fulcio failure when that independent check passed.
        try {
          report.registryPublishProofs = await verifyTargetRegistryPublications(lock, AFFECTED);
          report.independentlyVerifiedRegistryPublishSignature =
            'PASS_PINNED_NPM_REGISTRY_ECDSA';
        } catch (registryError) {
          report.independentlyVerifiedRegistryPublishSignature = 'FAIL_CLOSED';
          report.registryProofFailureCategory = classifyRegistryProofFailure(registryError);
          throw new Error('REGISTRY_PUBLISH_ECDSA_VERIFICATION_FAILED');
        }
      } else {
        report.trustedProvenanceStatus = 'UNSUPPORTED_BY_NPM10';
      }
    } else {
      report.jsonAttestations = 'UNSUPPORTED_BY_BUNDLED_NPM';
    }
  } catch (err) {
    failed = true;
    report.failureCode = /^[A-Z0-9_]{3,80}$/.test(err.message)
      ? err.message : 'UNEXPECTED_DIAGNOSTIC_FAILURE';
  } finally {
    rmSync(temp, { recursive: true, force: true });
    report.outcome = failed ? 'FAIL_CLOSED' : 'PASS_HISTORICAL_CAUSE_UNRESOLVED';
    const safe = JSON.stringify(report, null, 2);
    console.log(safe);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY,
        '### npm/Sigstore diagnostics — ' + report.replica + '\n\n' +
        'Outcome: **' + report.outcome + '**; signature verification: **' +
        report.signatures + '**.\n\n' + String.fromCharCode(96,96,96) + 'json\n' +
        safe + '\n' + String.fromCharCode(96,96,96) + '\n\n' +
        'Raw npm responses and attestation bundles NOT uploaded.\n');
    }
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runDiagnostic();
}
