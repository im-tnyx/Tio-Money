// Diagnostic-only preload. Hash the exact bounded bytes consumed by the
// instrumented JSON reader; no response body is persisted or printed.
'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { realpathSync, writeFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');

const MAX = 8 * 1024 * 1024;
const TARGETS = new Map([
  ['@babel/helper-compilation-targets', '7.29.13'],
  ['@babel/types', '7.29.15'],
]);
const evidence = [];
let stage = 'PRELOAD_STARTED';
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
    try { writeFileSync(filename, JSON.stringify({ stage, evidence }), { mode: 0o600 }); }
    catch { /* Parent treats missing report as UNVERIFIED. */ }
  }
}
process.on('exit', report);

// npm's executable is commonly a symlink in setup-node; resolve its real
// npm-cli.js location before locating the bundled fetch implementation.
const npmRequire = createRequire(realpathSync(process.argv[1]));
stage = 'NPM_PATH_RESOLVED';
const modulePath = npmRequire.resolve('make-fetch-happen');
const original = npmRequire(modulePath);
assert.equal(typeof original, 'function', 'TAP_FETCH_MODULE_UNEXPECTED');
stage = 'FETCH_MODULE_LOADED';
const wrapped = async (...args) => {
  const target = classify(args[0]);
  const response = await original(...args);
  if (target && response?.status === 200) {
    stage = 'TARGET_RESPONSE_SEEN';
    const item = { ...target, order: evidence.length + 1, status: 'UNVERIFIED' };
    evidence.push(item);
    assert.equal(typeof response.json, 'function', 'TAP_JSON_READER_UNAVAILABLE');
    assert.equal(typeof response.buffer, 'function', 'TAP_BUFFER_READER_UNAVAILABLE');
    // npm's minipass-fetch JSON reader also consumes bytes and JSON.parse's
    // UTF-8 string. This instrumented replacement may affect timing/errors.
    response.json = async () => {
      response.size = MAX;
      const bytes = await response.buffer();
      assert.ok(bytes.length <= MAX, 'TAP_TARGET_RESPONSE_TOO_LARGE');
      item.sha256 = createHash('sha256').update(bytes).digest('hex');
      item.bytes = bytes.length;
      item.status = 'HASHED_INSTRUMENTED_RESPONSE';
      stage = 'TARGET_RESPONSE_HASHED';
      return JSON.parse(bytes.toString('utf8'));
    };
  }
  return response;
};
Object.assign(wrapped, original);
require.cache[modulePath].exports = wrapped;
stage = 'FETCH_HOOK_INSTALLED';
