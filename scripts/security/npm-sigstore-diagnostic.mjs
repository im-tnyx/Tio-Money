// TM-SEC-SIGSTORE-20261122-001: no secrets, no raw network output, fail closed.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = join(ROOT, '.github/preview-eas-cli');
const REGISTRY = 'https://registry.npmjs.org';
const LOCK_BLOB = 'fa92a2b84071c5cb974becffd6ac74dabf050989';
export const AFFECTED = Object.freeze({
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

export function sanitizeFailure(raw) {
  const value = String(raw || '');
  const found = /([0-9]+) packages? have invalid attestations?/i.exec(value);
  return {
    invalidAttestationCount: found ? Number(found[1]) : null,
    affectedPackagesMentioned: Object.keys(AFFECTED).filter(n => value.includes(n)),
    categories: ['invalid attestation', 'invalid signature', 'missing signature',
      'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'EINTEGRITY']
      .filter(s => value.toLowerCase().includes(s.toLowerCase())),
    rawOutputRetained: false,
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
    jsonAttestations: 'NOT_RUN', independentSigstoreVerification: false,
    rawAttestationsUploaded: false,
  };
  let failed = false;
  try {
    const manifest = readFileSync(join(SOURCE, 'package.json'));
    const lockBytes = readFileSync(join(SOURCE, 'package-lock.json'));
    report.lockGitBlob = gitBlobSha1(lockBytes);
    report.lockSha256 = createHash('sha256').update(lockBytes).digest('hex');
    report.manifestSha256 = createHash('sha256').update(manifest).digest('hex');
    report.packages = verifyLock(JSON.parse(lockBytes.toString('utf8')), lockBytes);
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
    const install = execNpm(['ci', '--ignore-scripts', '--no-audit', '--no-fund',
      '--prefer-online', '--registry=' + REGISTRY], temp, env, 300000);
    report.install = safeStatus(install);
    if (report.install !== 'PASS') {
      report.failure = { gate: 'NPM_CI', ...sanitizeFailure(install.stdout + '\n' + install.stderr) };
      throw new Error('NPM_CI_FAILED');
    }
    const signatures = execNpm(['audit', 'signatures', '--registry=' + REGISTRY], temp, env);
    report.signatures = safeStatus(signatures);
    if (report.signatures !== 'PASS') {
      report.failure = { gate: 'NPM_AUDIT_SIGNATURES', ...sanitizeFailure(signatures.stdout + '\n' + signatures.stderr) };
      throw new Error('NPM_AUDIT_SIGNATURES_FAILED');
    }
    const support = execNpm(['config', 'get', 'include-attestations'], temp, env, 20000);
    if (support.status === 0 && isIncludeAttestationsSupported(support.stdout)) {
      const detail = execNpm(['audit', 'signatures', '--json', '--include-attestations',
        '--registry=' + REGISTRY], temp, env);
      report.jsonAttestations = safeStatus(detail);
      if (report.jsonAttestations !== 'PASS') {
        report.failure = { gate: 'NPM_JSON_ATTESTATIONS', ...sanitizeFailure(detail.stdout + '\n' + detail.stderr) };
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
