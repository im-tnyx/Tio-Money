import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { sanitizeTapReport } from '../../scripts/security/npm-sigstore-http-boundary.mjs';

const names = ['@babel/helper-compilation-targets@7.29.13', '@babel/types@7.29.15'];
const fixture = () => ({ evidence: names.flatMap((packageId, i) =>
  ['packument', 'attestation'].map((kind, j) => ({ packageId, kind,
    order: i * 2 + j + 1, status: 'HASHED_INSTRUMENTED_RESPONSE',
    sha256: 'a'.repeat(64), bytes: 123 }))) });

test('first bounded response for each exact locked package is recorded without payload', () => {
  const out = sanitizeTapReport(fixture());
  assert.equal(out.first.length, 4);
  assert.equal(out.counts[names[0]].attestation, 1);
  assert.equal(out.exactFirstHttpResponseFromHistoricalFailure, false);
  assert.equal(out.rawResponsesPersisted, false);
});

test('missing observation, spoofed identity and malformed hash fail closed', () => {
  const missing = fixture(); missing.evidence.pop();
  assert.throws(() => sanitizeTapReport(missing), /TAP_TARGET_RESPONSE_NOT_OBSERVED/);
  const spoofed = fixture(); spoofed.evidence[0].packageId = '@babel/evil@7.29.15';
  assert.throws(() => sanitizeTapReport(spoofed), /TAP_REPORT_UNVERIFIED/);
  const poisoned = fixture(); poisoned.evidence[0].sha256 = 'token=secret';
  assert.throws(() => sanitizeTapReport(poisoned), /TAP_REPORT_UNVERIFIED/);
  assert.ok(!JSON.stringify(sanitizeTapReport(fixture())).includes('token='));
});

test('unbounded, duplicate-count overflow and non-first historical claims are rejected', () => {
  const huge = fixture(); huge.evidence[0].bytes = 9 * 1024 * 1024;
  assert.throws(() => sanitizeTapReport(huge), /TAP_REPORT_UNVERIFIED/);
  const many = fixture(); many.evidence = Array.from({ length: 33 }, () => many.evidence[0]);
  assert.throws(() => sanitizeTapReport(many), /TAP_REPORT_INVALID/);
});

test('preload hashes first in-process response without writing body or request credentials', () => {
  const root = mkdtempSync(join(tmpdir(), 'tm-tap-fixture-'));
  try {
    const mod = join(root, 'node_modules/make-fetch-happen');
    mkdirSync(mod, { recursive: true });
    writeFileSync(join(mod, 'index.js'), `module.exports = async () => ({
      status: 200, clone: () => ({ buffer: async () => Buffer.from('private-fixture-body') })
    });`);
    const cli = join(root, 'npm-cli.cjs');
    writeFileSync(cli, `require('make-fetch-happen')(
      'https://registry.npmjs.org/%40babel%2Ftypes').then(() => {});`);
    const bin = join(root, 'npm');
    symlinkSync(cli, bin);
    const tap = join(dirname(fileURLToPath(import.meta.url)),
      '../../scripts/security/npm-sigstore-http-tap.cjs');
    const report = join(root, 'result.json');
    const result = spawnSync(process.execPath, ['--require', tap, bin], {
      encoding: 'utf8', timeout: 10000,
      env: { ...process.env, TM_HTTP_TAP_REPORT: report },
    });
    assert.equal(result.status, 0, 'instrumented fixture process failed');
    const raw = readFileSync(report, 'utf8');
    assert.ok(!raw.includes('private-fixture-body'));
    const first = JSON.parse(raw).evidence[0];
    assert.equal(first.packageId, '@babel/types@7.29.15');
    assert.equal(first.sha256, createHash('sha256').update('private-fixture-body').digest('hex'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
