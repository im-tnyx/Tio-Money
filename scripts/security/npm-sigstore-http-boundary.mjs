// Issue #71: one isolated instrumented npm10 audit, with fail-closed first result.
// This never claims to reproduce the original historical failing HTTP bytes.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { firstFailureFingerprint } from './npm-sigstore-first-failure.mjs';
import { gitBlobSha1, verifyLock } from './npm-sigstore-diagnostic.mjs';
import { verifierVersions } from './npm-sigstore-metadata.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = join(ROOT, '.github/preview-eas-cli');
const LOCK_BLOB = 'fa92a2b84071c5cb974becffd6ac74dabf050989';
const REQUIRED = new Set([
  '@babel/helper-compilation-targets@7.29.13', '@babel/types@7.29.15',
]);
const TARGETS = new Set([
  '@babel/generator@7.29.15',
  '@babel/helpers@7.29.15',
  '@babel/helper-module-transforms@7.29.13',
  '@babel/helper-validator-identifier@7.29.7',
  '@babel/traverse@7.29.15',
  '@babel/helper-compilation-targets@7.29.13',
  '@babel/code-frame@7.29.7',
  '@babel/types@7.29.15',
]);
const TAP_REJECTIONS = new Set([
  'TAP_BODY_READ_REJECTED', 'TAP_BODY_CHUNK_INVALID',
  'TAP_BODY_TOO_LARGE', 'TAP_BODY_UNSUPPORTED', 'TAP_JSON_INVALID',
]);
export function sanitizeTapReport(data, { allowPartial = false } = {}) {
  assert.ok(Array.isArray(data?.evidence) && data.evidence.length <= 32,
    'TAP_REPORT_INVALID');
  const evidence = data.evidence.map((item, index) => {
    assert.ok(TARGETS.has(item.packageId) &&
      ['packument', 'attestation'].includes(item.kind) &&
      Number.isSafeInteger(item.order) && item.order === index + 1 &&
      item.order <= 32, 'TAP_REPORT_UNVERIFIED');
    const base = { packageId: item.packageId, kind: item.kind, order: item.order };
    if (item.status === 'HASHED_INSTRUMENTED_RESPONSE') {
      assert.ok(/^[0-9a-f]{64}$/.test(item.sha256) &&
        Number.isSafeInteger(item.bytes) && item.bytes > 0 &&
        item.bytes <= 8 * 1024 * 1024, 'TAP_REPORT_UNVERIFIED');
      return { ...base, status: 'HASHED_INSTRUMENTED_RESPONSE',
        sha256: item.sha256, bytes: item.bytes };
    }
    if (item.status === 'NON_200') {
      assert.ok(['4XX', '5XX', 'OTHER'].includes(item.statusClass),
        'TAP_REPORT_UNVERIFIED');
      return { ...base, status: 'NON_200', statusClass: item.statusClass };
    }
    if (item.status === 'FETCH_REJECTED') {
      return { ...base, status: 'FETCH_REJECTED' };
    }
    if (item.status === 'REJECTED') {
      assert.ok(TAP_REJECTIONS.has(item.failureCategory),
        'TAP_REPORT_UNVERIFIED');
      return { ...base, status: 'REJECTED',
        failureCategory: item.failureCategory };
    }
    throw new Error('TAP_REPORT_UNVERIFIED');
  });
  const first = [...REQUIRED].flatMap(packageId =>
    ['packument', 'attestation'].map(kind => evidence.find(item =>
      item.packageId === packageId && item.kind === kind &&
      item.status === 'HASHED_INSTRUMENTED_RESPONSE')));
  if (!allowPartial) {
    assert.ok(first.every(Boolean), 'TAP_TARGET_RESPONSE_NOT_OBSERVED');
  }
  return { first: first.filter(Boolean), observed: evidence,
    captureCompleteness: allowPartial ? 'PARTIAL_FIRST_FAILURE_UNVERIFIED' :
      'REQUIRED_PACKUMENTS_AND_ATTESTATIONS_HASHED',
    counts: Object.fromEntries([...TARGETS].map(packageId => [packageId,
      Object.fromEntries(['packument', 'attestation'].map(kind => [kind,
        evidence.filter(item => item.packageId === packageId &&
          item.kind === kind && item.status === 'HASHED_INSTRUMENTED_RESPONSE').length]))])),
    exactFirstHttpResponseFromHistoricalFailure: false,
    instrumentedNpmCliPath: true, rawResponsesPersisted: false };
}
function run(args, cwd, env, timeout) {
  return spawnSync('npm', args, { cwd, env, encoding: 'utf8', timeout,
    maxBuffer: 6 * 1024 * 1024 });
}
export function main() {
  const temp = mkdtempSync(join(tmpdir(), 'tm-npm-http-boundary-'));
  const report = { gate: 'TM-SEC-71-FIRST-NPM-HTTP-BOUNDARY',
    result: 'FAIL_CLOSED', originalHistoricalHttpBytes: 'NOT_CAPTURED',
    instrumentedRunMayAlterTiming: true, noRawHttpOrCliOutput: true };
  try {
    const lockBytes = readFileSync(join(SOURCE, 'package-lock.json'));
    const lock = JSON.parse(lockBytes.toString('utf8'));
    verifyLock(lock, lockBytes);
    assert.equal(gitBlobSha1(lockBytes), LOCK_BLOB);
    report.lockSha256 = createHash('sha256').update(lockBytes).digest('hex');
    copyFileSync(join(SOURCE, 'package.json'), join(temp, 'package.json'));
    copyFileSync(join(SOURCE, 'package-lock.json'), join(temp, 'package-lock.json'));
    mkdirSync(join(temp, 'cache'), { mode: 0o700 });
    writeFileSync(join(temp, 'user.npmrc'), '', { mode: 0o600 });
    writeFileSync(join(temp, 'global.npmrc'), '', { mode: 0o600 });
    const env = { PATH: process.env.PATH || '/usr/bin:/bin', HOME: temp,
      CI: 'true', LANG: 'C.UTF-8', npm_config_registry: 'https://registry.npmjs.org',
      npm_config_userconfig: join(temp, 'user.npmrc'),
      npm_config_globalconfig: join(temp, 'global.npmrc'),
      npm_config_cache: join(temp, 'cache'), npm_config_ignore_scripts: 'true',
      npm_config_update_notifier: 'false', npm_config_progress: 'false' };
    const version = run(['--version'], temp, env, 15000);
    assert.equal(version.status, 0, 'TAP_NPM_VERSION_UNAVAILABLE');
    assert.equal(version.stdout.trim(), '10.9.2', 'TAP_UNREVIEWED_NPM_VERSION');
    const global = run(['root', '-g'], temp, env, 15000);
    assert.equal(global.status, 0, 'TAP_NPM_MODULE_ROOT_UNAVAILABLE');
    const versions = verifierVersions(global.stdout.trim());
    assert.equal(versions.sigstore, '3.0.0', 'TAP_UNREVIEWED_VERIFIER');
    assert.equal(versions.sigstoreVerify, '2.0.0', 'TAP_UNREVIEWED_VERIFIER');
    assert.equal(versions.sigstoreTuf, '3.0.0', 'TAP_UNREVIEWED_VERIFIER');
    const install = run(['ci', '--ignore-scripts', '--no-audit', '--no-fund',
      '--prefer-online', '--registry=https://registry.npmjs.org'], temp, env, 300000);
    assert.equal(install.status, 0, 'TAP_ISOLATED_NPM_CI_FAILED');
    const path = join(ROOT, 'scripts/security/npm-sigstore-http-tap.cjs');
    const audit = run(['audit', 'signatures', '--registry=https://registry.npmjs.org'],
      temp, { ...env, NODE_OPTIONS: '--require=' + path,
        TM_HTTP_TAP_REPORT: join(temp, 'capture.json'),
        npm_config_cache: join(temp, 'audit-cache') }, 240000);
    // Inspect the first result only; never rerun after a failure.
    report.auditResult = audit.status === 0 && !audit.error && !audit.signal ? 'PASS' : 'FAIL';
    try {
      const snapshot = JSON.parse(readFileSync(join(temp, 'capture.json'), 'utf8'));
      report.tapStage = ['PRELOAD_STARTED', 'NPM_PATH_RESOLVED',
        'FETCH_MODULE_LOADED', 'FETCH_HOOK_INSTALLED', 'TARGET_RESPONSE_SEEN',
        'TARGET_RESPONSE_HASHED', 'TARGET_RESPONSE_REJECTED'].includes(snapshot.stage) ? snapshot.stage : 'UNVERIFIED';
      // Only predefined local categories may be published; never forward
      // npm's raw response/parser/transport exception.
      const failed = snapshot.evidence?.find(item => item.status === 'REJECTED');
      report.tapReaderFailureCategory = [
        'TAP_BODY_READ_REJECTED', 'TAP_BODY_CHUNK_INVALID',
        'TAP_BODY_TOO_LARGE', 'TAP_BODY_UNSUPPORTED', 'TAP_JSON_INVALID',
      ].includes(failed?.failureCategory) ? failed.failureCategory : undefined;
      report.boundary = sanitizeTapReport(snapshot,
        { allowPartial: report.auditResult !== 'PASS' });
    } catch { report.boundary = 'UNVERIFIED_OR_INCOMPLETE'; }
    if (!report.tapStage) report.tapStage = 'NO_CAPTURE_FILE';
    if (report.auditResult !== 'PASS') {
      report.firstFailure = firstFailureFingerprint({ stdout: audit.stdout,
        stderr: audit.stderr, exitStatus: audit.status, signal: audit.signal,
        npmVersion: version.stdout.trim(), verifierVersions: versions, lock, lockBytes });
      const observed = typeof report.boundary === 'object' ?
        report.boundary.observed : [];
      report.firstFailureBoundaryCorrelation = {
        interpretation: 'INSTRUMENTED_FIRST_AUDIT_ONLY_CAUSE_UNVERIFIED',
        packages: report.firstFailure.reportedInvalidPackageIds.map(packageId => ({
          packageId,
          httpObservations: observed.filter(item => item.packageId === packageId),
          coverage: observed.some(item => item.packageId === packageId) ?
            'PARTIAL_OR_COMPLETE_OBSERVATION' : 'NO_REVIEWED_RESPONSE_OBSERVED',
        })),
        noHistoricalHttpBytesClaim: true,
      };
      throw new Error('TAP_FIRST_AUDIT_FAILURE');
    }
    assert.notEqual(report.boundary, 'UNVERIFIED_OR_INCOMPLETE', 'TAP_NO_VERIFIED_BOUNDARY');
    report.result = 'INSTRUMENTED_FIRST_AUDIT_PASS_BOUNDARY_CAPTURED';
  } catch (error) {
    report.failureCategory = ['TAP_FIRST_AUDIT_FAILURE', 'TAP_NO_VERIFIED_BOUNDARY',
      'TAP_ISOLATED_NPM_CI_FAILED', 'TAP_UNREVIEWED_NPM_VERSION',
      'TAP_UNREVIEWED_VERIFIER'].includes(error?.message) ? error.message : 'OTHER';
    process.exitCode = 1;
  } finally {
    rmSync(temp, { recursive: true, force: true });
    console.log(JSON.stringify(report, null, 2));
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
