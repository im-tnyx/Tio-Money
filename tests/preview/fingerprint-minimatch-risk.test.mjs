// Issue #69: guard the observed Expo fingerprint options boundary.
// This regression test is not a fix for GHSA-g3hv-75wg-m249 and must not
// be used to dismiss the still-open Dependabot alert.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
const requireFromProject = createRequire(join(ROOT, 'package.json'));

test('the installed Expo fingerprint default matcher does not opt into vulnerable globparts preprocessing', () => {
  const lock = readJson('package-lock.json');
  const lockedFingerprint = lock.packages['node_modules/@expo/fingerprint'];
  assert.ok(lockedFingerprint?.version, 'Expo fingerprint must be present in the root lockfile');

  const installed = requireFromProject('@expo/fingerprint/package.json');
  assert.equal(installed.version, lockedFingerprint.version, 'npm ci must install the locked fingerprint version');

  // Verify the actual installed module rather than only a GitHub upstream source snapshot.
  const { buildPathMatchObjects } = requireFromProject('@expo/fingerprint/build/utils/Path.js');
  assert.equal(typeof buildPathMatchObjects, 'function', 'Fingerprint matcher entry point changed: re-review advisory reachability');
  const matchers = buildPathMatchObjects(['**/*.tsx']);
  assert.equal(matchers.length, 1);
  const matcher = matchers[0];
  assert.equal(matcher.options?.dot, true, 'Fingerprint matcher defaults changed');
  assert.ok(
    (matcher.options?.optimizationLevel ?? 1) < 2,
    'GHSA-g3hv-75wg-m249: fingerprint enabled optimizationLevel >= 2; security re-review required',
  );
  assert.equal(matcher.match('src/main.tsx'), true);
  assert.equal(matcher.match('.hidden/main.tsx'), true);
});

test('the project has no custom fingerprint patterns or optimization configuration', () => {
  const app = readJson('app.json').expo;
  assert.deepEqual(app.runtimeVersion, { policy: 'fingerprint' });
  for (const path of ['fingerprint.config.js', 'fingerprint.config.ts', '.fingerprintignore']) {
    assert.equal(existsSync(join(ROOT, path)), false, `${path} requires a fresh untrusted-glob input review`);
  }
});
