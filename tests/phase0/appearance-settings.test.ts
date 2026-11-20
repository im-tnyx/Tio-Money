import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  APPEARANCE_OPTIONS,
  parseAppearancePreference,
  resolveAppearanceScheme,
} from '../../src/shared/theme/appearance-preference';
import { en } from '../../src/shared/i18n/strings';

test('appearance modes use stable identifiers and safe invalid-value fallback', () => {
  assert.deepEqual(APPEARANCE_OPTIONS, ['system', 'light', 'dark']);
  assert.equal(parseAppearancePreference(null), 'system');
  assert.equal(parseAppearancePreference(''), 'system');
  assert.equal(parseAppearancePreference('DARK'), 'system');
  assert.equal(parseAppearancePreference('light'), 'light');
  assert.equal(parseAppearancePreference('dark'), 'dark');
  assert.equal(parseAppearancePreference({ invalid: true }), 'system');
});

test('system mode tracks OS changes, manual modes ignore OS', () => {
  assert.equal(resolveAppearanceScheme('system', 'light'), 'light');
  assert.equal(resolveAppearanceScheme('system', 'dark'), 'dark');
  assert.equal(resolveAppearanceScheme('system', null), 'light');
  assert.equal(resolveAppearanceScheme('light', 'dark'), 'light');
  assert.equal(resolveAppearanceScheme('dark', 'light'), 'dark');
});

test('UI copy is centralized and English, with accessible radio choices', () => {
  assert.equal(en.generalSettings, 'General Settings');
  assert.equal(en.appearance, 'Appearance');
  const screen = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  assert.match(screen, /accessibilityRole="radio"/);
  assert.match(screen, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(screen, /APPEARANCE_OPTIONS\.map/);
  assert.doesNotMatch(screen, /useState|setState|setItemSync|openDatabase/);
});

test('persistence and global application stay out of presentation', () => {
  const store = readFileSync('src/data/preferences/appearance-preference-store.ts', 'utf8');
  const provider = readFileSync('src/shared/theme/theme-provider.tsx', 'utf8');
  const root = readFileSync('src/app/_layout.tsx', 'utf8');
  assert.match(store, /expo-sqlite\/kv-store/);
  assert.match(store, /Storage\.getItemSync/);
  assert.match(store, /Storage\.setItemSync/);
  assert.match(provider, /appearanceStore\.write\(value\)/);
  assert.match(provider, /readInitialPreference/);
  assert.match(provider, /appearanceSaveError/);
  assert.match(root, /appearanceStore=\{appearancePreferenceStore\}/);
  assert.match(root, /theme\.scheme === 'dark' \? 'light' : 'dark'/);
  assert.doesNotMatch(root, /setColorScheme/);
});
