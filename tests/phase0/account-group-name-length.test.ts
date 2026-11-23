import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  DEFAULT_ACCOUNT_GROUP_PREFERENCES,
  MAX_CUSTOM_GROUP_NAME_LENGTH,
  addCustomGroupLabel,
  isAccountGroupPreferences,
  parseAccountGroupPreferences,
  renameCustomGroupLabel,
} from '../../src/features/settings/account-group-preferences';

test('Add and Rename accept 20 but reject 21 characters', () => {
  assert.equal(MAX_CUSTOM_GROUP_NAME_LENGTH, 20);
  const name20 = 'A'.repeat(20);
  const added = addCustomGroupLabel(DEFAULT_ACCOUNT_GROUP_PREFERENCES, name20);
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.equal(added.preferences.customGroups[0]?.name, name20);

  const tooLong = 'B'.repeat(21);
  assert.deepEqual(addCustomGroupLabel(DEFAULT_ACCOUNT_GROUP_PREFERENCES, tooLong), {
    ok: false,
    error: 'name',
  });
  const renamed = renameCustomGroupLabel(added.preferences, 'custom-1', 'B'.repeat(20));
  assert.equal(renamed.ok, true);
  if (renamed.ok) assert.equal(renamed.preferences.customGroups[0]?.name, 'B'.repeat(20));
  assert.deepEqual(renameCustomGroupLabel(added.preferences, 'custom-1', tooLong), {
    ok: false,
    error: 'name',
  });
  assert.deepEqual(renameCustomGroupLabel(added.preferences, 'custom-1', ' '), {
    ok: false,
    error: 'name',
  });

  const normalized = addCustomGroupLabel(DEFAULT_ACCOUNT_GROUP_PREFERENCES, '  Daily\n Cash  ');
  assert.equal(normalized.ok, true);
  if (normalized.ok) assert.equal(normalized.preferences.customGroups[0]?.name, 'Daily Cash');
  const invalidSaved = {
    version: 1,
    showDescriptions: false,
    customGroups: [{ id: 'custom-1', name: tooLong }],
  };
  assert.equal(isAccountGroupPreferences(invalidSaved), false);
  assert.throws(() => parseAccountGroupPreferences(JSON.stringify(invalidSaved)));
});

test('only custom labels and Add/Rename input are single-line', () => {
  const screen = readFileSync('src/features/settings/account-groups-screen.tsx', 'utf8');
  const field = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');
  const strings = readFileSync('src/shared/i18n/strings.ts', 'utf8');

  const customSegment = screen.split('state.customGroups.map')[1];
  const builtInSegment = screen.split('BUILT_IN_ACCOUNT_GROUPS.map')[1];
  assert.ok(customSegment);
  assert.ok(builtInSegment);
  const customRows = customSegment.split('</SwipeableCustomGroupRow>')[0];
  const builtInRows = builtInSegment.split('state.customGroups.map')[0];
  assert.ok(customRows);
  assert.ok(builtInRows);
  assert.match(screen, /maxLength=\{MAX_CUSTOM_GROUP_NAME_LENGTH\}/);
  assert.match(screen, /multiline=\{false\}/);
  assert.match(screen, /returnKeyType="done"/);
  assert.match(customRows, /<AppText numberOfLines=\{1\}>\{group.name\}<\/AppText>/);
  assert.doesNotMatch(builtInRows, /numberOfLines=\{1\}/);
  assert.match(strings, /1–20 characters/);
  assert.match(field, /TextInputProps/);
  assert.doesNotMatch(field, /maxLength=\{20\}|multiline=\{false\}/);
});
