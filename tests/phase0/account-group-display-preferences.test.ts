import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  DEFAULT_ACCOUNT_GROUP_PREFERENCES,
  MAX_CUSTOM_GROUPS,
  addCustomGroupLabel,
  isAccountGroupPreferences,
  parseAccountGroupPreferences,
} from '../../src/features/settings/account-group-preferences';

test('custom group display labels stay local-only and are limited to five', () => {
  assert.equal(MAX_CUSTOM_GROUPS, 5);
  let state = DEFAULT_ACCOUNT_GROUP_PREFERENCES;
  assert.deepEqual(state.customGroups, []);
  assert.equal(state.showDescriptions, false);
  for (let i = 0; i < MAX_CUSTOM_GROUPS; i += 1) {
    const result = addCustomGroupLabel(state, `Custom ${i + 1}`);
    assert.equal(result.ok, true);
    if (result.ok) state = result.preferences;
  }
  assert.equal(state.customGroups.length, 5);
  assert.equal(addCustomGroupLabel(state, 'Sixth').ok, false);
  assert.equal(isAccountGroupPreferences(state), true);
  assert.deepEqual(parseAccountGroupPreferences(JSON.stringify(state)), state);
});

test('empty, duplicate, overlong and malformed group names cannot be saved', () => {
  const state = DEFAULT_ACCOUNT_GROUP_PREFERENCES;
  for (const name of ['', '   ', 'Cash', 'cash', 'BANK ACCOUNT', 'A'.repeat(41), 'Hi\u0000']) {
    assert.equal(addCustomGroupLabel(state, name).ok, false, name);
  }
  const first = addCustomGroupLabel(state, '  My   Savings  ');
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(first.preferences.customGroups[0]?.name, 'My Savings');
  assert.equal(addCustomGroupLabel(first.preferences, 'my savings').ok, false);
  assert.equal(isAccountGroupPreferences({ ...first.preferences, customGroups: [{ id: 'custom-9', name: 'Other' }] }), false);
  assert.throws(() => parseAccountGroupPreferences('{invalid'));
  assert.throws(() => parseAccountGroupPreferences(JSON.stringify({
    version: 1,
    showDescriptions: false,
    customGroups: [{ id: 'custom-1', name: 'Cash' }],
  })));
});

test('the 200-weight home_storage SVG is only on Settings Account Groups row, not catalogue list', () => {
  const source = readFileSync('src/shared/assets/google-material-icons/home_storage.svg', 'utf8').trim();
  const icon = JSON.parse(readFileSync(
    'src/shared/assets/google-material-icons/settings-account-groups-icon.json', 'utf8',
  )) as string;
  assert.equal(source, icon);
  assert.match(icon, /viewBox="0 -960 960 960"/);
  assert.match(icon, /m233\.85-184\.61-66\.93-400\.01/);
  const presentation = readFileSync('src/features/settings/account-groups-setting-icon.tsx', 'utf8');
  const settings = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const screen = readFileSync('src/features/settings/account-groups-screen.tsx', 'utf8');
  assert.match(presentation, /iconRoleSizes\.card/);
  assert.match(settings, /<AccountGroupsSettingIcon color=\{theme\.colors\.secondaryText\} \/>/);
  assert.doesNotMatch(screen, /AccountGroupsSettingIcon|home_storage|SvgXml|Svg|<Path/);
});

test('group screen stays dumb, uses two tokenized header actions and no financial writes', () => {
  const screen = readFileSync('src/features/settings/account-groups-screen.tsx', 'utf8');
  const bar = readFileSync('src/shared/ui/app-top-bar.tsx', 'utf8');
  const viewModel = readFileSync('src/features/settings/use-account-groups-view-model.ts', 'utf8');
  const store = readFileSync('src/data/preferences/account-group-preference-store.ts', 'utf8');
  assert.match(screen, /key: 'details'/);
  assert.match(screen, /key: 'add'/);
  assert.ok(screen.indexOf("key: 'details'") < screen.indexOf("key: 'add'"));
  assert.match(screen, /state\.showDescriptions \? 'eye-off' : 'eye'/);
  assert.match(screen, /disabled: !state\.canAdd/);
  assert.match(bar, /height: theme\.navigation\.topBarHeight/);
  assert.match(bar, /width=\{theme\.iconRoles\.topBar\}/);
  assert.match(viewModel, /accountGroupPreferenceStore\.write/);
  assert.match(viewModel, /setDraftError/);
  assert.match(store, /expo-sqlite\/kv-store/);
  assert.match(store, /tio-money\.account-groups-display\.v1/);
  assert.doesNotMatch(screen, /useState|useEffect|useRouter|Storage\.|database|fetch\(|supabase|createAccount/);
  assert.doesNotMatch(store, /journal|transaction|financialLedger|supabase|fetch\(/);
});

test('Add Account Group sheet reuses shared shell, buttons and text field', () => {
  const screen = readFileSync('src/features/settings/account-groups-screen.tsx', 'utf8');
  const field = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');
  const button = readFileSync('src/shared/ui/action-button.tsx', 'utf8');
  const modal = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  assert.match(screen, /<AppBottomSheet/);
  assert.match(screen, /<AppTextField/);
  assert.equal((screen.match(/<ActionButton/g) ?? []).length, 2);
  assert.doesNotMatch(screen, /<TextInput|<Modal|style=\{\{[^}]*fontSize:/);
  assert.match(field, /TextInputProps/);
  assert.match(field, /minHeight: theme\.buttons\.minimumHeight/);
  assert.match(field, /placeholderTextColor=\{theme\.colors\.secondaryText\}/);
  assert.match(field, /borderColor: invalid \? theme\.colors\.expense : theme\.colors\.border/);
  assert.match(field, /fontSize: theme\.typeScale\.body/);
  assert.match(button, /export function ActionButton/);
  assert.match(modal, /export function AppBottomSheet/);
  assert.match(screen, /maxLength=\{MAX_CUSTOM_GROUP_NAME_LENGTH\}/);
});
