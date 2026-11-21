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
    '@expo/build-tools@27.4.1', '@expo/eas-json@27.4.1', 'eas-cli@27.4.1', 'minimatch@5.1.2', 'nanoid@3.3.8', 'node-forge@1.4.0', 'tar@7.5.19',
  ].sort());
  assert.equal(candidate.overrides['minimatch@5.1.2'], '5.1.8');
  assert.deepEqual(candidate.overrides['@expo/eas-json@27.4.1'], { joi: '17.13.9' });
  assert.deepEqual(candidate.overrides['eas-cli@27.4.1'], { joi: '17.13.9', ajv: '8.18.0', yaml: '2.8.3' });
  assert.deepEqual(candidate.overrides['@expo/build-tools@27.4.1'], { joi: '17.13.9' });
  assert.equal(candidate.overrides['node-forge@1.4.0'], '1.4.3');
  assert.equal(candidate.overrides.joi, undefined);
  const alreadyApproved = { ...source, overrides: { ...candidate.overrides } };
  assert.deepEqual(createCandidateManifest(alreadyApproved).overrides, candidate.overrides);
  assert.equal(candidate.overrides['minimatch'], undefined);
  assert.equal(candidate.overrides.ajv, undefined);
  assert.equal(candidate.overrides.yaml, undefined);
});

test('candidate rejects EAS identity, Babel pin drift and unreviewed override changes', () => {
  assert.throws(() => createCandidateManifest({ ...source, dependencies: { 'eas-cli': '28.0.0' } }), /Refusing changed/);
  assert.throws(() => createCandidateManifest({ ...source, overrides: { ...source.overrides, 'node-forge': '*' } }), /Unexpected prior/);
  assert.throws(() => createCandidateManifest({ ...source, overrides: { ...source.overrides, '@babel/helper-module-transforms': '7.29.14' } }), /Refusing changed/);
  assert.throws(() => createCandidateManifest({ ...source, overrides: { ...source.overrides, 'eas-cli@27.4.1': { joi: '0.0.0' } } }), /Unreviewed existing dependency override/);
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


test('official-registry lockfile retains patched AJV/YAML/Forge copies and exact EAS CLI pin', () => {
  const lock = JSON.parse(readFileSync(new URL('../../.github/preview-eas-cli/package-lock.json', import.meta.url), 'utf8'));
  assert.equal(lock.packages['node_modules/eas-cli'].version, '27.4.1');
  assert.equal(lock.packages['node_modules/ajv'].version, '8.18.0');
  assert.equal(lock.packages['node_modules/node-forge'].version, '1.4.3');
  assert.equal(lock.packages['node_modules/yaml'].version, '2.8.3');
  assert.equal(lock.packages['node_modules/fast-uri'].version, '3.1.9');
  assert.equal(lock.packages['node_modules/uri-js'], undefined);
  assert.equal(lock.packages['node_modules/punycode'], undefined);
});
