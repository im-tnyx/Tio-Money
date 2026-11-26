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

// The published v10.2.6 implementation defaults optimizationLevel to 1 and
// enters firstPhasePreProcess only at >= 2. These version gates deliberately
// FAIL CLOSED when a dependency changes, until its new semantics are reviewed.
// This is not an upstream vulnerability patch or an automated alert dismissal.
// The 0.22.0 review found that Path.js and Options.js match 0.21.10
// byte for byte and the nested minimatch version is unchanged.
const REVIEWED_FINGERPRINT_VERSION = '0.22.0';
const REVIEWED_MINIMATCH_VERSION = '10.2.6';

test('the installed Expo fingerprint default matcher does not opt into vulnerable globparts preprocessing', () => {
  const lock = readJson('package-lock.json');
  const lockedFingerprint = lock.packages['node_modules/@expo/fingerprint'];
  assert.equal(
    lockedFingerprint?.version,
    REVIEWED_FINGERPRINT_VERSION,
    'Unreviewed @expo/fingerprint change: re-evaluate GHSA-g3hv-75wg-m249 reachability',
  );

  const installed = requireFromProject('@expo/fingerprint/package.json');
  assert.equal(installed.version, lockedFingerprint.version, 'npm ci must install the locked fingerprint version');

  const lockedMinimatch = lock.packages['node_modules/@expo/fingerprint/node_modules/minimatch'];
  assert.equal(
    lockedMinimatch?.version,
    REVIEWED_MINIMATCH_VERSION,
    'Unreviewed nested minimatch change: verify effective optimizationLevel default before accepting',
  );

  // Resolve the exact implementation used by fingerprint, not an unrelated
  // hoisted/root minimatch copy. Lockfile integrity is verified by npm ci.
  const requireFromFingerprint = createRequire(
    requireFromProject.resolve('@expo/fingerprint/package.json'),
  );
  const installedMinimatch = requireFromFingerprint('minimatch/package.json');
  assert.equal(
    installedMinimatch.version,
    lockedMinimatch.version,
    'Installed minimatch must match the reviewed nested lockfile version',
  );
  const { Minimatch } = requireFromFingerprint('minimatch');

  // Verify the actual installed module rather than only a GitHub upstream source snapshot.
  const { buildPathMatchObjects } = requireFromProject('@expo/fingerprint/build/utils/Path.js');
  assert.equal(typeof buildPathMatchObjects, 'function', 'Fingerprint matcher entry point changed: re-review advisory reachability');
  const matchers = buildPathMatchObjects(['**/*.tsx']);
  assert.equal(matchers.length, 1);
  const matcher = matchers[0];
  assert.ok(matcher instanceof Minimatch, 'Fingerprint selected an unreviewed minimatch implementation');
  assert.equal(matcher.options?.dot, true, 'Fingerprint matcher defaults changed');
  assert.equal(
    matcher.options?.optimizationLevel,
    undefined,
    'Fingerprint now supplies optimizationLevel explicitly: security re-review required',
  );
  // Absence is safe ONLY because the installed, reviewed minimatch@10.2.6
  // source sets optimizationLevel=1. Version gates above must fail on changes.
  assert.equal(matcher.match('src/main.tsx'), true);
  assert.equal(matcher.match('.hidden/main.tsx'), true);
});

test('custom fingerprint config changes require input-boundary review (presence alone is not unsafe)', () => {
  const app = readJson('app.json').expo;
  assert.deepEqual(app.runtimeVersion, { policy: 'fingerprint' });
  // Review sentinel, not a claim that a supported config file is exploitable:
  // the GHSA needs attacker-controlled glob AND effective optimizationLevel >= 2.
  for (const path of ['fingerprint.config.js', 'fingerprint.config.ts', '.fingerprintignore']) {
    assert.equal(existsSync(join(ROOT, path)), false, `${path} requires a fresh untrusted-glob input review`);
  }
});
