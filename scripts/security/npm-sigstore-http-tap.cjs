// Diagnostic-only preload. The original Response still goes to npm's verifier.
// A bounded clone is hashed before delivery; no response body is persisted.
'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');

const MAX = 8 * 1024 * 1024;
const TARGETS = new Map([
  ['@babel/helper-compilation-targets', '7.29.13'],
  ['@babel/types', '7.29.15'],
]);
const evidence = [];
function classify(uri) {
  try {
    const url = new URL(typeof uri === 'string' ? uri : uri?.url);
    if (url.origin !== 'https://registry.npmjs.org' || url.search || url.hash ||
      url.username || url.password) return null;
    const path = decodeURIComponent(url.pathname);
    for (const [name, version] of TARGETS) {
      if (path === '/' + name) return { packageId: name + '@' + version, kind: 'packument' };
      if (path === '/-/npm/v1/attestations/' + name + '@' + version)
        return { packageId: name + '@' + version, kind: 'attestation' };
    }
  } catch { /* Non-target requests never enter the report. */ }
  return null;
}
function report() {
  const filename = process.env.TM_HTTP_TAP_REPORT;
  if (filename && resolve(filename) === filename) {
    try { writeFileSync(filename, JSON.stringify({ evidence }), { mode: 0o600 }); }
    catch { /* Parent treats missing report as UNVERIFIED. */ }
  }
}
process.on('exit', report);

const npmRequire = createRequire(process.argv[1]);
const modulePath = npmRequire.resolve('make-fetch-happen');
const original = npmRequire(modulePath);
assert.equal(typeof original, 'function', 'TAP_FETCH_MODULE_UNEXPECTED');
const wrapped = async (...args) => {
  const target = classify(args[0]);
  const response = await original(...args);
  if (target && response?.status === 200) {
    const item = { ...target, order: evidence.length + 1, status: 'UNVERIFIED' };
    evidence.push(item);
    // Clone uses the very same response stream; no second registry GET.
    // The bounded read is diagnostic instrumentation and may alter timing.
    const copy = response.clone();
    copy.size = MAX;
    const bytes = await copy.buffer();
    assert.ok(bytes.length <= MAX, 'TAP_TARGET_RESPONSE_TOO_LARGE');
    item.sha256 = createHash('sha256').update(bytes).digest('hex');
    item.bytes = bytes.length;
    item.status = 'HASHED_INSTRUMENTED_RESPONSE';
  }
  return response;
};
Object.assign(wrapped, original);
require.cache[modulePath].exports = wrapped;
