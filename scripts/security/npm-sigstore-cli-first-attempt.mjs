// Issue #71 Gate 8. Sample one first unmodified npm CLI audit per clean runner.
// This is diagnostic evidence only, NEVER historical provenance trust approval.
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { firstFailureFingerprint } from './npm-sigstore-first-failure.mjs';
import { verifierVersions } from './npm-sigstore-metadata.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = join(ROOT, '.github/preview-eas-cli');
const REGISTRY = 'https://registry.npmjs.org';
const LOCK_BLOB = 'fa92a2b84071c5cb974becffd6ac74dabf050989';
export const LOCK_SHA256 = '664b9505a3eff95735f8aad055338cb0402015d35852c5286aba5a40ebaa4aff';
const PINNED = Object.freeze({
  'npm10-clean': {
    node: 'v22.16.0', npm: '10.9.2',
    verifier: { sigstore: '3.0.0', sigstoreVerify: '2.0.0', sigstoreTuf: '3.0.0' },
  },
  'npm11-clean': {
    node: 'v26.8.2', npm: '11.19.1',
    verifier: { sigstore: '4.1.1', sigstoreVerify: '3.1.1', sigstoreTuf: '4.0.2' },
  },
});

export function validateToolchain(replica, node, npm, verifier) {
  const selected = Object.hasOwn(PINNED, replica) ? PINNED[replica] : null;
  assert.ok(selected, 'UNREVIEWED_DIAGNOSTIC_REPLICA');
  assert.equal(node, selected.node, 'DIAGNOSTIC_NODE_VERSION_CHANGED');
  assert.equal(npm, selected.npm, 'DIAGNOSTIC_NPM_VERSION_CHANGED');
  for (const key of ['sigstore', 'sigstoreVerify', 'sigstoreTuf']) {
    assert.equal(verifier?.[key], selected.verifier[key],
      'DIAGNOSTIC_SIGSTORE_VERSION_CHANGED_' + key);
  }
  return { replica, node, npm, verifier: { ...selected.verifier } };
}

export function verifyCommittedLock(bytes, manifestBytes) {
  assert.ok(Buffer.isBuffer(bytes) && Buffer.isBuffer(manifestBytes),
    'DIAGNOSTIC_COMMITTED_BYTES_REQUIRED');
  const gitBlob = createHash('sha1').update('blob ' + bytes.length + '\0')
    .update(bytes).digest('hex');
  assert.equal(gitBlob, LOCK_BLOB, 'DIAGNOSTIC_EAS_LOCK_BLOB_CHANGED');
  const lockSha256 = createHash('sha256').update(bytes).digest('hex');
  assert.equal(lockSha256, LOCK_SHA256, 'DIAGNOSTIC_EAS_LOCK_HASH_CHANGED');
  const lock = JSON.parse(bytes.toString('utf8'));
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  assert.equal(manifest.dependencies?.['eas-cli'], '27.4.1',
    'DIAGNOSTIC_EAS_VERSION_CHANGED');
  assert.equal(lock.packages?.['node_modules/eas-cli']?.version, '27.4.1',
    'DIAGNOSTIC_LOCKED_EAS_VERSION_CHANGED');
  assert.equal(lock.packages?.['']?.dependencies?.['eas-cli'], '27.4.1',
    'DIAGNOSTIC_LOCK_ROOT_VERSION_CHANGED');
  return { lock, lockSha256 };
}

export function firstAuditVerdict(result, lock, lockBytes, toolchain) {
  if (result.status === 0 && !result.error && !result.signal) {
    return {
      decision: 'PASS_FIRST_UNMODIFIED_CLI_ATTEMPT_ONLY',
      historicalCause: 'UNVERIFIED',
      originalHistoricalHttpBytes: 'NOT_CAPTURED',
      lockSha256: LOCK_SHA256,
      ...toolchain,
      rawCliOutputRetained: false,
    };
  }
  const first = firstFailureFingerprint({
    stdout: result.stdout,
    stderr: result.stderr,
    exitStatus: result.status,
    signal: result.signal,
    npmVersion: toolchain.npm,
    verifierVersions: toolchain.verifier,
    lock, lockBytes,
  });
  return {
    decision: 'FAIL_CLOSED_FIRST_UNMODIFIED_CLI_ATTEMPT',
    historicalCause: 'UNVERIFIED',
    originalHistoricalHttpBytes: 'NOT_CAPTURED',
    ...toolchain, first, rawCliOutputRetained: false,
  };
}

function run(args, cwd, env, timeout) {
  return spawnSync('npm', args, {
    cwd, env, encoding: 'utf8', timeout, maxBuffer: 6 * 1024 * 1024,
  });
}

export function cleanNpmEnvironment(temp, path) {
  return {
    PATH: path, HOME: temp, TMPDIR: temp, LANG: 'C.UTF-8',
    CI: 'true', npm_config_registry: REGISTRY,
    npm_config_userconfig: join(temp, 'user.npmrc'),
    npm_config_globalconfig: join(temp, 'global.npmrc'),
    npm_config_cache: join(temp, 'npm-cache'),
    npm_config_ignore_scripts: 'true', npm_config_update_notifier: 'false',
    npm_config_progress: 'false',
  };
}

export function executeFirstAttempt() {
  const temp = mkdtempSync(join(tmpdir(), 'tm-cli-first-'));
  try {
    const lockBytes = readFileSync(join(SOURCE, 'package-lock.json'));
    const manifestBytes = readFileSync(join(SOURCE, 'package.json'));
    const verified = verifyCommittedLock(lockBytes, manifestBytes);
    for (const name of ['package-lock.json', 'package.json']) {
      copyFileSync(join(SOURCE, name), join(temp, name));
    }
    mkdirSync(join(temp, 'npm-cache'), { mode: 0o700 });
    for (const name of ['user.npmrc', 'global.npmrc']) {
      writeFileSync(join(temp, name), '', { mode: 0o600 });
    }
    const env = cleanNpmEnvironment(temp, process.env.PATH || '/usr/bin:/bin');
    const npm = run(['--version'], temp, env, 15000);
    assert.equal(npm.status, 0, 'DIAGNOSTIC_NPM_UNAVAILABLE');
    const root = run(['root', '-g'], temp, env, 15000);
    assert.equal(root.status, 0, 'DIAGNOSTIC_NPM_ROOT_UNAVAILABLE');
    assert.ok(root.stdout.trim().length < 500, 'DIAGNOSTIC_NPM_ROOT_INVALID');
    const toolchain = validateToolchain(
      process.env.DIAGNOSTIC_REPLICA || '',
      process.version, npm.stdout.trim(), verifierVersions(root.stdout.trim()),
    );
    const install = run([
      'ci', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=' + REGISTRY,
    ], temp, env, 300000);
    if (install.status !== 0 || install.error || install.signal) {
      return {
        decision: 'FAIL_CLOSED_ISOLATED_NPM_CI', historicalCause: 'UNVERIFIED',
        lockSha256: verified.lockSha256, ...toolchain, rawCliOutputRetained: false,
      };
    }
    // One attempt only. No second JSON audit, policy downgrade or retry.
    const audit = run(['audit', 'signatures', '--registry=' + REGISTRY],
      temp, env, 240000);
    return firstAuditVerdict(audit, verified.lock, lockBytes, toolchain);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    assert.equal(process.env.GITHUB_ACTIONS, 'true', 'CI_ONLY_DIAGNOSTIC');
    const report = executeFirstAttempt();
    console.log(JSON.stringify(report));
    if (report.decision !== 'PASS_FIRST_UNMODIFIED_CLI_ATTEMPT_ONLY') {
      process.exitCode = 1;
    }
  } catch {
    // Never print raw stderr/stdout, token, HTTP response or a thrown exception.
    console.error('DIAGNOSTIC_ABORT_FAIL_CLOSED');
    process.exitCode = 1;
  }
}
