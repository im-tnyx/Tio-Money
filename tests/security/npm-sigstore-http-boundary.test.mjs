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
    writeFileSync(join(mod, 'index.js'), `const { Readable } = require('node:stream');
    module.exports = async () => {
      const result = { status: 200, json: async () => ({}),
        body: Readable.from([Buffer.from('{"private":"fixture-body"}')]) };
      // minipass-fetch treats size as EXPECTED length, never as a limit.
      Object.defineProperty(result, 'size', { get: () => 0,
        set: () => { throw new Error('TAP_MUST_NOT_SET_EXACT_SIZE'); } });
      return result;
    };`);
    const cli = join(root, 'npm-cli.cjs');
    writeFileSync(cli, `require('make-fetch-happen')(
      'https://registry.npmjs.org/%40babel%2Ftypes').then(res => res.json())
      .then(value => { if (value.private !== 'fixture-body') process.exitCode = 1; });`);
    const bin = join(root, 'npm');
    symlinkSync(cli, bin);
    const tap = join(dirname(fileURLToPath(import.meta.url)),
      '../../scripts/security/npm-sigstore-http-tap.cjs');
    const report = join(root, 'result.json');
    const result = spawnSync(process.execPath, ['--require', tap, bin], {
      encoding: 'utf8', timeout: 10000,
      env: { PATH: process.env.PATH || '/usr/bin:/bin',
        TM_HTTP_TAP_REPORT: report },
    });
    assert.equal(result.status, 0, 'instrumented fixture process failed');
    const raw = readFileSync(report, 'utf8');
    assert.ok(!raw.includes('fixture-body'));
    const first = JSON.parse(raw).evidence[0];
    assert.equal(first.packageId, '@babel/types@7.29.15');
    assert.equal(first.sha256, createHash('sha256')
      .update('{"private":"fixture-body"}').digest('hex'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});


test('streamed oversized response fails before JSON parsing and preserves no body', () => {
  const root = mkdtempSync(join(tmpdir(), 'tm-tap-oversize-'));
  try {
    const mod = join(root, 'node_modules/make-fetch-happen');
    mkdirSync(mod, { recursive: true });
    writeFileSync(join(mod, 'index.js'), [
      "const { Readable } = require('node:stream');",
      "module.exports = async () => ({ status: 200,",
      "  body: Readable.from([Buffer.alloc(4*1024*1024, 88),",
      "    Buffer.alloc(4*1024*1024+1, 89)]),",
      "  json: async () => ({untrusted:'fixture-secret'}) });",
    ].join('\n'));
    const cli = join(root, 'npm-cli.cjs');
    writeFileSync(cli,
      "require('make-fetch-happen')(" +
      "'https://registry.npmjs.org/%40babel%2Ftypes')" +
      ".then(r => r.json()).then(() => { process.exitCode = 7; })" +
      ".catch(() => { process.exitCode = 1; });");
    const bin = join(root, 'npm');
    symlinkSync(cli, bin);
    const tap = join(dirname(fileURLToPath(import.meta.url)),
      '../../scripts/security/npm-sigstore-http-tap.cjs');
    const report = join(root, 'result.json');
    const result = spawnSync(process.execPath, ['--require', tap, bin], {
      encoding: 'utf8', timeout: 10000,
      env: { PATH: process.env.PATH || '/usr/bin:/bin',
        TM_HTTP_TAP_REPORT: report },
    });
    assert.equal(result.status, 1, 'oversized stream must fail');
    const raw = readFileSync(report, 'utf8');
    assert.ok(!raw.includes('fixture-secret'));
    const data = JSON.parse(raw);
    assert.equal(data.stage, 'TARGET_RESPONSE_REJECTED');
    assert.equal(data.evidence[0].status, 'REJECTED');
    assert.equal(data.evidence[0].failureCategory, 'TAP_BODY_TOO_LARGE');
    assert.equal(data.evidence[0].sha256, undefined);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('malformed streamed JSON fails with redacted allowlisted category', () => {
  const root = mkdtempSync(join(tmpdir(), 'tm-tap-bad-json-'));
  try {
    const mod = join(root, 'node_modules/make-fetch-happen');
    mkdirSync(mod, { recursive: true });
    writeFileSync(join(mod, 'index.js'), [
      "const { Readable } = require('node:stream');",
      "module.exports = async () => ({ status: 200,",
      " body: Readable.from([Buffer.from('{invalid fixture-secret')]),",
      " json: async () => ({}) });",
    ].join('\n'));
    const cli = join(root, 'npm-cli.cjs');
    writeFileSync(cli,
      "require('make-fetch-happen')(" +
      "'https://registry.npmjs.org/%40babel%2Ftypes')" +
      ".then(r => r.json()).catch(() => { process.exitCode = 1; });");
    const bin = join(root, 'npm');
    symlinkSync(cli, bin);
    const tap = join(dirname(fileURLToPath(import.meta.url)),
      '../../scripts/security/npm-sigstore-http-tap.cjs');
    const report = join(root, 'result.json');
    const result = spawnSync(process.execPath, ['--require', tap, bin], {
      encoding: 'utf8', timeout: 10000,
      env: { PATH: process.env.PATH || '/usr/bin:/bin',
        TM_HTTP_TAP_REPORT: report },
    });
    assert.equal(result.status, 1);
    const raw = readFileSync(report, 'utf8');
    assert.ok(!raw.includes('fixture-secret'));
    assert.equal(JSON.parse(raw).evidence[0].failureCategory, 'TAP_JSON_INVALID');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
