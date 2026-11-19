import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));

test('EAS preview is tied only to owner-confirmed Tio-Money project', () => {
  const expo = readJson('app.json').expo;
  assert.equal(expo.name, 'Tio Money');
  assert.equal(expo.owner, 'tnyx-23');
  assert.equal(expo.slug, 'tio-money');
  assert.equal(expo.extra.eas.projectId, '722e6857-1159-4414-a024-6a4351e7d3e1');
  assert.equal(expo.extra.releaseStage, 'phase-0-foundation');
  assert.equal(expo.updates.url, 'https://u.expo.dev/722e6857-1159-4414-a024-6a4351e7d3e1');
  assert.deepEqual(expo.runtimeVersion, { policy: 'fingerprint' });
  assert.equal(expo.android.permissions.length, 0);
  assert.equal(expo.ios.supportsTablet, true);
});

test('preview build is internal and not a production release', () => {
  const eas = readJson('eas.json');
  assert.deepEqual(Object.keys(eas.build), ['preview']);
  assert.equal(eas.build.preview.distribution, 'internal');
  assert.equal(eas.build.preview.channel, 'pr-preview');
  assert.equal(eas.build.preview.android.buildType, 'apk');
  assert.equal(eas.build.production, undefined);
  assert.equal(eas.submit, undefined);
});

test('SDK 58 expo-updates is checked into both manifests with resolved transitive entries', () => {
  const manifest = readJson('package.json');
  const lock = readJson('package-lock.json');
  assert.equal(manifest.dependencies['expo-updates'], '~58.0.22');
  assert.equal(lock.packages[''].dependencies['expo-updates'], '~58.0.22');
  assert.equal(lock.packages['node_modules/expo-updates'].version, '58.0.22');
  for (const name of ['expo-eas-client', 'expo-json-utils', 'expo-manifests',
    'expo-structured-headers', 'expo-updates-interface']) {
    assert.ok(lock.packages['node_modules/' + name]?.integrity, name);
  }
  assert.equal(lock.packages['node_modules/expo-updates/node_modules/arg'].version, '4.1.3');
});

test('EAS publishing workflow is manual, owner-gated, nonproduction and isolated', () => {
  const text = readFileSync(join(ROOT, '.github/workflows/tio-money-eas-pr-preview.yml'), 'utf8');
  assert.match(text, /workflow_dispatch:/);
  assert.doesNotMatch(text, /^\s+push:\s*$/m);
  assert.doesNotMatch(text, /^\s+pull_request:\s*$/m);
  assert.doesNotMatch(text, /workflow_run:/);
  assert.match(text, /github\.actor == 'im-tnyx'/);
  assert.match(text, /github\.ref == 'refs\/heads\/main'/);
  assert.match(text, /tio-money-eas-preview-trusted/);
  assert.match(text, /EXPO_TOKEN: \$\{\{ secrets\.EXPO_TOKEN \}\}/);
  assert.match(text, /eas-cli@latest update/);
  assert.match(text, /--branch pr-preview/);
  assert.match(text, /--environment preview/);
  assert.doesNotMatch(text, /--branch production|--channel production/);
  assert.match(text, /native_change=0/);
  assert.match(text, /\.head\.repo\.full_name == \$repo/);
  assert.match(text, /\.user\.login == "im-tnyx"/);
});
