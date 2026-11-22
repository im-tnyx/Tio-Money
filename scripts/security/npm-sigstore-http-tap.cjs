// Diagnostic-only preload. Hash the exact bounded bytes consumed by the
// instrumented JSON reader; no response body is persisted or printed.
'use strict';
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
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
    // CRITICAL: minipass-fetch's response.size means an EXPECTED exact
    // stream length (MinipassSized), NOT an upper bound. Never assign MAX.
    // Read the decoded response body incrementally, with a hard byte cap.
    // This is not a wire capture and may change the instrumented audit timing.
    response.json = async () => {
      let failure = 'TAP_BODY_READ_REJECTED';
      try {
        const body = response.body;
        const chunks = [];
        let total = 0;
        const append = value => {
          if (!(Buffer.isBuffer(value) || typeof value === 'string' ||
            value instanceof Uint8Array)) {
            failure = 'TAP_BODY_CHUNK_INVALID';
            throw new Error(failure);
          }
          const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
          total += bytes.length;
          if (total > MAX) {
            failure = 'TAP_BODY_TOO_LARGE';
            throw new Error(failure);
          }
          chunks.push(bytes);
        };
        if (Buffer.isBuffer(body)) {
          append(body);
        } else if (body && typeof body[Symbol.asyncIterator] === 'function') {
          try {
            for await (const chunk of body) append(chunk);
          } catch {
            body.destroy?.();
            throw new Error(failure);
          }
        } else {
          failure = 'TAP_BODY_UNSUPPORTED';
          throw new Error(failure);
        }
        const bytes = Buffer.concat(chunks, total);
        item.sha256 = createHash('sha256').update(bytes).digest('hex');
        item.bytes = bytes.length;
        item.status = 'HASHED_INSTRUMENTED_RESPONSE';
        stage = 'TARGET_RESPONSE_HASHED';
        try { return JSON.parse(bytes.toString('utf8')); }
        catch { failure = 'TAP_JSON_INVALID'; throw new Error(failure); }
      } catch {
        item.status = 'REJECTED';
        item.failureCategory = failure;
        stage = 'TARGET_RESPONSE_REJECTED';
        // Never print the original parser, transport or HTTP error.
        throw new Error(failure);
      }
    };
  }
  return response;
};
Object.assign(wrapped, original);
require.cache[modulePath].exports = wrapped;
stage = 'FETCH_HOOK_INSTALLED';
