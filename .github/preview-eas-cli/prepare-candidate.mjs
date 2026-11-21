// Issue #59: safely prepare a review-only isolated EAS CLI dependency candidate.
// Default is OFFLINE/READ-ONLY. --candidate resolves ONLY in a fresh OS tmpdir.
// No Expo tokens, deployments, Codespace restarts, source or lockfile writes.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inventoryLockfile } from './audit-security.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const REGISTRY = 'https://registry.npmjs.org';
const PATCHES = Object.freeze({
  // Target only the old resolved versions: do not downgrade nested minimatch 9/10.
  'node-forge@1.4.0': '1.4.1',
  'minimatch@5.1.2': '5.1.8',
  'nanoid@3.3.8': '3.3.18',
  '@expo/eas-json@27.4.1': Object.freeze({ joi: '17.13.9' }),
  'tar@7.5.19': '7.5.21',
});

export function createCandidateManifest(input) {
  if (!input || input.name !== 'tio-money-verified-eas-cli' ||
      input.dependencies?.['eas-cli'] !== '27.4.1' ||
      input.devDependencies?.typescript !== '5.9.3' ||
      input.overrides?.['@babel/helper-module-transforms'] !== '7.29.13' ||
      input.overrides?.['@babel/plugin-transform-modules-commonjs'] !== '7.29.7') {
    throw new Error('Refusing changed trusted EAS CLI identity or signed Babel pins');
  }
  if (Object.keys(input.overrides).some((key) =>
    !['@babel/helper-module-transforms', '@babel/plugin-transform-modules-commonjs'].includes(key))) {
    throw new Error('Unexpected prior EAS CLI overrides; re-review required');
  }
  return {
    ...input,
    overrides: { ...input.overrides, ...PATCHES },
  };
}

export function validateCandidateLockfile(lock) {
  const summary = inventoryLockfile(lock);
  if (summary.belowFloor || summary.unknown) {
    throw new Error('Candidate below researched advisory floors or unknown: ' +
      summary.belowFloor + '/' + summary.unknown + '; offending copies: ' +
      JSON.stringify(summary.copies.filter((entry) => entry.result !== 'MEETS_FLOOR')));
  }
  for (const [path, pkg] of Object.entries(lock.packages)) {
    if (!path) continue;
    if (pkg.resolved && (!pkg.resolved.startsWith(REGISTRY + '/') ||
        !pkg.integrity?.startsWith('sha512-'))) {
      throw new Error('Unverified registry URL or integrity for ' + path);
    }
  }
  return summary;
}

function command(cwd, executable, args, { acceptAuditExit = false } = {}) {
  const env = { ...process.env, EXPO_TOKEN: '', GITHUB_TOKEN: '', NODE_AUTH_TOKEN: '' };
  const proc = spawnSync(executable, args, { cwd, env, encoding: 'utf8', timeout: 300000, maxBuffer: 12_000_000 });
  if (proc.error) throw proc.error;
  if (!acceptAuditExit && proc.status !== 0) {
    throw new Error(executable + ' ' + args[0] + ' failed (exit ' + proc.status + '): ' +
      (proc.stderr || proc.stdout || '').slice(-1200));
  }
  return proc;
}

export function readPlan() {
  const source = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const candidate = createCandidateManifest(source);
  return { cli: source.dependencies['eas-cli'], originalOverrides: source.overrides, proposed: PATCHES, candidate };
}

export function makeCandidate() {
  const plan = readPlan();
  const output = mkdtempSync(join(tmpdir(), 'tio-money-eas-security-candidate-'));
  let verified = false;
  try {
    writeFileSync(join(output, 'package.json'), JSON.stringify(plan.candidate, null, 2) + '\n', { mode: 0o600 });
    const npmOptions = ['--ignore-scripts', '--no-fund', '--registry=' + REGISTRY];
    command(output, 'npm', ['install', '--package-lock-only', '--no-audit', ...npmOptions]);
    const lock = JSON.parse(readFileSync(join(output, 'package-lock.json'), 'utf8'));
    const summary = validateCandidateLockfile(lock);
    command(output, 'npm', ['ci', '--no-audit', ...npmOptions]);
    command(output, 'npm', ['audit', 'signatures', '--registry=' + REGISTRY]);
    const version = command(output, join(output, 'node_modules', '.bin', 'eas'), ['--version']);
    if (!/^(?:eas-cli\/)?27\.4\.1(?:\s|$)/.test(version.stdout.trim())) {
      throw new Error('Unexpected EAS CLI binary version: ' + version.stdout.trim().slice(0, 80));
    }
    const audit = command(output, 'npm', ['audit', '--json', '--registry=' + REGISTRY], { acceptAuditExit: true });
    let report;
    try { report = JSON.parse(audit.stdout); } catch { throw new Error('npm audit JSON missing/invalid'); }
    const remaining = report.metadata?.vulnerabilities;
    if (!remaining || !Number.isInteger(remaining.high) || !Number.isInteger(remaining.critical)) {
      throw new Error('npm audit did not produce severity totals');
    }
    if (remaining.high || remaining.critical) {
      throw new Error('Candidate still has High/Critical npm advisories: ' +
        JSON.stringify({ high: remaining.high, critical: remaining.critical }));
    }
    verified = true;
    console.log(JSON.stringify({
      status: 'CANDIDATE_ONLY_NOT_MERGED', outputDirectory: output,
      cliVersion: plan.cli, verifiedCopies: summary.copies.length, npmAudit: remaining,
      warning: 'Manual independent supply-chain review and Android/iOS no-QR Expo Go QA still REQUIRED',
    }, null, 2));
  } finally {
    if (!verified) rmSync(output, { recursive: true, force: true });
  }
}

const self = process.argv[1] && fileURLToPath(import.meta.url) === (await import('node:path')).resolve(process.argv[1]);
if (self) {
  if (process.argv.length === 2 || process.argv[2] === '--plan') {
    console.log(JSON.stringify(readPlan(), null, 2));
  } else if (process.argv.length === 3 && process.argv[2] === '--candidate') {
    try { makeCandidate(); } catch (error) { console.error('NO CANDIDATE: ' + error.message); process.exitCode = 1; }
  } else {
    console.error('Usage: node .github/preview-eas-cli/prepare-candidate.mjs [--plan|--candidate]');
    process.exitCode = 2;
  }
}
