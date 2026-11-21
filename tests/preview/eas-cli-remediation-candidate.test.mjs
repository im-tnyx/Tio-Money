import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createCandidateManifest, validateCandidateLockfile, readPlan } from '../../.github/preview-eas-cli/prepare-candidate.mjs';

const source = JSON.parse(readFileSync(new URL('../../.github/preview-eas-cli/package.json', import.meta.url), 'utf8'));

test('candidate preserves exact EAS CLI, TypeScript and signed Babel pins without touching source', () => {
  const serialized = JSON.stringify(source);
  const candidate = createCandidateManifest(source);
  assert.equal(source.dependencies['eas-cli'], '27.4.1');
  assert.deepEqual(candidate.dependencies, source.dependencies);
  assert.deepEqual(candidate.devDependencies, source.devDependencies);
  assert.equal(candidate.overrides['@babel/helper-module-transforms'], '7.29.13');
  assert.equal(candidate.overrides['@babel/plugin-transform-modules-commonjs'], '7.29.7');
  assert.equal(JSON.stringify(source), serialized);
  const proposed = readPlan().proposed;
  assert.deepEqual(Object.keys(proposed).sort(), [
    'joi@17.11.0', 'minimatch@5.1.2', 'nanoid@3.3.8', 'node-forge@1.4.0', 'tar@7.5.19',
  ].sort());
  assert.equal(candidate.overrides['minimatch@5.1.2'], '5.1.8');
  assert.equal(candidate.overrides['minimatch'], undefined);
});

test('candidate rejects EAS identity, Babel pin drift and unreviewed override changes', () => {
  assert.throws(() => createCandidateManifest({ ...source, dependencies: { 'eas-cli': '28.0.0' } }), /Refusing changed/);
  assert.throws(() => createCandidateManifest({ ...source, overrides: { ...source.overrides, 'node-forge': '*' } }), /Unexpected prior/);
  assert.throws(() => createCandidateManifest({ ...source, overrides: { ...source.overrides, '@babel/helper-module-transforms': '7.29.14' } }), /Refusing changed/);
});

test('lockfile candidate rejects missing SHA512 and untrusted registries, or unfixed copies', () => {
  const good = {
    lockfileVersion: 3,
    packages: {
      '': { dependencies: { 'eas-cli': '27.4.1' }, devDependencies: { typescript: '5.9.3' } },
      'node_modules/eas-cli': { version: '27.4.1', resolved: 'https://registry.npmjs.org/eas-cli/-/eas-cli-27.4.1.tgz', integrity: 'sha512-placeholder' },
      'node_modules/nanoid': { version: '3.3.18', resolved: 'https://registry.npmjs.org/nanoid/-/nanoid-3.3.18.tgz', integrity: 'sha512-placeholder' },
    },
  };
  assert.equal(validateCandidateLockfile(good).belowFloor, 0);
  const old = structuredClone(good);
  old.packages['node_modules/nanoid'].version = '3.3.8';
  assert.throws(() => validateCandidateLockfile(old), /below researched/);
  const evil = structuredClone(good);
  evil.packages['node_modules/nanoid'].resolved = 'https://untrusted.invalid/nanoid.tgz';
  assert.throws(() => validateCandidateLockfile(evil), /Unverified registry/);
  const unsigned = structuredClone(good);
  unsigned.packages['node_modules/nanoid'].integrity = undefined;
  assert.throws(() => validateCandidateLockfile(unsigned), /Unverified registry/);
});

test('QR-free Android/iOS Expo Go script remains independent of EAS remediation', () => {
  const root = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const tasks = JSON.parse(readFileSync(new URL('../../.vscode/tasks.json', import.meta.url), 'utf8'));
  assert.equal(root.scripts.mobile, 'expo start --tunnel --go');
  assert.ok(tasks.tasks.some(({ label }) => label === 'Expo Go Tunnel (Interactive)'));
  assert.ok(tasks.tasks.some(({ label }) => label === 'Start Expo Project (Tunnel)'));
});
