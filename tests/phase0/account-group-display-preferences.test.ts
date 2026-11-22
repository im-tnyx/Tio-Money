import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  DEFAULT_ACCOUNT_GROUP_PREFERENCES,
  MAX_CUSTOM_GROUPS,
  MAX_CUSTOM_GROUP_NAME_LENGTH,
  addCustomGroupLabel,
  isAccountGroupPreferences,
  parseAccountGroupPreferences,
  removeCustomGroupLabel,
  renameCustomGroupLabel,
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
  for (const name of ['', '   ', 'Cash', 'cash', 'BANK ACCOUNT', 'A'.repeat(21), 'Hi\u0000']) {
    assert.equal(addCustomGroupLabel(state, name).ok, false, name);
  }
  const first = addCustomGroupLabel(state, '  My   Savings  ');
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(first.preferences.customGroups[0]?.name, 'My Savings');
  assert.equal(addCustomGroupLabel(first.preferences, 'my savings').ok, false);
  const malformedGroup = {
    ...first.preferences,
    customGroups: [{ id: 'custom-9', name: 'Other' }],
  };
  assert.equal(isAccountGroupPreferences(malformedGroup), false);
  assert.throws(() => parseAccountGroupPreferences('{invalid'));
  const duplicateBuiltIn = {
    version: 1,
    showDescriptions: false,
    customGroups: [{ id: 'custom-1', name: 'Cash' }],
  };
  assert.throws(() => parseAccountGroupPreferences(JSON.stringify(duplicateBuiltIn)));
});

test('home_storage SVG appears only on Settings Account Groups row, not catalogue', () => {
  const sourcePath = 'src/shared/assets/google-material-icons/home_storage.svg';
  const iconPath = 'src/shared/assets/google-material-icons/settings-account-groups-icon.json';
  const source = readFileSync(sourcePath, 'utf8').trim();
  const icon = JSON.parse(readFileSync(iconPath, 'utf8')) as string;
  assert.equal(source, icon);
  assert.match(icon, /viewBox="0 -960 960 960"/);
  assert.match(icon, /m233\.85-184\.61-66\.93-400\.01/);
  const presentationPath = 'src/features/settings/account-groups-setting-icon.tsx';
  const presentation = readFileSync(presentationPath, 'utf8');
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
  assert.match(screen, /state\.showDescriptions \? 'eye' : 'eye-off'/);
  assert.match(screen, /disabled: !state\.canAdd/);
  assert.match(bar, /height: theme\.navigation\.topBarHeight/);
  assert.match(bar, /width=\{theme\.iconRoles\.topBar\}/);
  assert.match(viewModel, /accountGroupPreferenceStore\.write/);
  assert.match(viewModel, /setDraftError/);
  assert.match(store, /expo-sqlite\/kv-store/);
  assert.match(store, /tio-money\.account-groups-display\.v1/);
  assert.doesNotMatch(
    screen,
    /useState|useEffect|useRouter|Storage\.|database|fetch\(|supabase|createAccount/,
  );
  assert.doesNotMatch(store, /journal|transaction|financialLedger|supabase|fetch\(/);
});

test('Add Account Group sheet has only Save; dismissal remains on shared shell', () => {
  const screen = readFileSync('src/features/settings/account-groups-screen.tsx', 'utf8');
  const field = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');
  const button = readFileSync('src/shared/ui/action-button.tsx', 'utf8');
  const modal = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  assert.match(screen, /<AppBottomSheet/);
  assert.match(screen, /avoidKeyboard/);
  assert.match(screen, /<AppTextField/);
  assert.equal((screen.match(/<ActionButton/g) ?? []).length, 1);
  assert.match(screen, /label=\{t\('accountGroupsSave'\)\}/);
  assert.match(screen, /type: 'custom\.save'/);
  assert.doesNotMatch(screen, /label=\{t\('accountGroupsCancel'\)\}/);
  assert.doesNotMatch(screen, /variant="secondary"/);
  assert.match(screen, /onDismiss=\{\(\) => onAction\(\{ type: 'custom\.dismiss' \}\)\}/);
  assert.match(screen, /dismissAccessibilityLabel=\{t\('accountGroupsCancel'\)\}/);
  assert.match(modal, /onRequestClose=\{onDismiss\}/);
  assert.match(modal, /onAccessibilityEscape=\{onDismiss\}/);
  assert.match(modal, /onPress=\{onDismiss\}/);
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

test('custom labels can be renamed but built-in labels and duplicates cannot', () => {
  const first = addCustomGroupLabel(DEFAULT_ACCOUNT_GROUP_PREFERENCES, 'Household');
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const second = addCustomGroupLabel(first.preferences, 'Holiday');
  assert.equal(second.ok, true);
  if (!second.ok) return;

  const same = renameCustomGroupLabel(second.preferences, 'custom-1', 'Household');
  assert.equal(same.ok, true);
  if (same.ok) assert.equal(same.preferences, second.preferences);

  const renamed = renameCustomGroupLabel(second.preferences, 'custom-1', '  Travel   Fund ');
  assert.equal(renamed.ok, true);
  if (!renamed.ok) return;
  assert.deepEqual(renamed.preferences.customGroups, [
    { id: 'custom-1', name: 'Travel Fund' },
    { id: 'custom-2', name: 'Holiday' },
  ]);
  assert.equal(isAccountGroupPreferences(renamed.preferences), true);
  assert.deepEqual(
    parseAccountGroupPreferences(JSON.stringify(renamed.preferences)),
    renamed.preferences,
  );

  assert.deepEqual(renameCustomGroupLabel(renamed.preferences, 'custom-1', 'holiday'), {
    ok: false,
    error: 'duplicate',
  });
  assert.deepEqual(renameCustomGroupLabel(renamed.preferences, 'custom-2', 'Cash'), {
    ok: false,
    error: 'duplicate',
  });
  assert.deepEqual(renameCustomGroupLabel(renamed.preferences, 'cash', 'Other'), {
    ok: false,
    error: 'missing',
  });
  assert.deepEqual(renameCustomGroupLabel(renamed.preferences, 'custom-9', 'Other'), {
    ok: false,
    error: 'missing',
  });
  assert.deepEqual(renameCustomGroupLabel(renamed.preferences, 'custom-2', '   '), {
    ok: false,
    error: 'name',
  });
  assert.deepEqual(renameCustomGroupLabel(renamed.preferences, 'custom-2', 'A'.repeat(21)), {
    ok: false,
    error: 'name',
  });
});

test('delete middle custom group reindexes v1 IDs and restores the max-five Add capacity', () => {
  let preferences = DEFAULT_ACCOUNT_GROUP_PREFERENCES;
  for (let i = 1; i <= MAX_CUSTOM_GROUPS; i += 1) {
    const added = addCustomGroupLabel(preferences, `Custom ${i}`);
    assert.equal(added.ok, true);
    if (!added.ok) return;
    preferences = added.preferences;
  }
  assert.equal(addCustomGroupLabel(preferences, 'Sixth').ok, false);
  const before = preferences;
  assert.equal(removeCustomGroupLabel(preferences, 'cash'), before);
  assert.equal(removeCustomGroupLabel(preferences, 'custom-99'), before);

  const reduced = removeCustomGroupLabel(preferences, 'custom-3');
  assert.deepEqual(reduced.customGroups, [
    { id: 'custom-1', name: 'Custom 1' },
    { id: 'custom-2', name: 'Custom 2' },
    { id: 'custom-3', name: 'Custom 4' },
    { id: 'custom-4', name: 'Custom 5' },
  ]);
  assert.equal(isAccountGroupPreferences(reduced), true);
  assert.deepEqual(parseAccountGroupPreferences(JSON.stringify(reduced)), reduced);
  const added = addCustomGroupLabel(reduced, 'Replacement');
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.equal(added.preferences.customGroups[4]?.id, 'custom-5');
  assert.equal(added.preferences.customGroups[4]?.name, 'Replacement');

  let remaining = added.preferences;
  while (remaining.customGroups.length > 0) {
    remaining = removeCustomGroupLabel(remaining, 'custom-1');
    assert.equal(isAccountGroupPreferences(remaining), true);
  }
  assert.deepEqual(remaining.customGroups, []);
  assert.equal(removeCustomGroupLabel(remaining, 'custom-1'), remaining);
});

test('custom group names accept 20 but reject 21 characters on Add and Rename', () => {
  assert.equal(MAX_CUSTOM_GROUP_NAME_LENGTH, 20);
  const twenty = 'A'.repeat(MAX_CUSTOM_GROUP_NAME_LENGTH);
  const valid = addCustomGroupLabel(DEFAULT_ACCOUNT_GROUP_PREFERENCES, twenty);
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  assert.equal(valid.preferences.customGroups[0]?.name, twenty);
  assert.deepEqual(addCustomGroupLabel(DEFAULT_ACCOUNT_GROUP_PREFERENCES, twenty + 'B'), {
    ok: false,
    error: 'name',
  });

  const renamed = renameCustomGroupLabel(valid.preferences, 'custom-1', 'B'.repeat(20));
  assert.equal(renamed.ok, true);
  if (renamed.ok) assert.equal(renamed.preferences.customGroups[0]?.name, 'B'.repeat(20));
  assert.deepEqual(renameCustomGroupLabel(valid.preferences, 'custom-1', 'B'.repeat(21)), {
    ok: false,
    error: 'name',
  });
  assert.deepEqual(renameCustomGroupLabel(valid.preferences, 'custom-1', '  '), {
    ok: false,
    error: 'name',
  });

  const normalized = addCustomGroupLabel(DEFAULT_ACCOUNT_GROUP_PREFERENCES, '  Daily\n  Cash  ');
  assert.equal(normalized.ok, true);
  if (normalized.ok) assert.equal(normalized.preferences.customGroups[0]?.name, 'Daily Cash');

  const invalidSaved = {
    version: 1,
    showDescriptions: false,
    customGroups: [{ id: 'custom-1', name: 'C'.repeat(21) }],
  };
  assert.equal(isAccountGroupPreferences(invalidSaved), false);
  assert.throws(() => parseAccountGroupPreferences(JSON.stringify(invalidSaved)));
});

test('only the custom group input/list are single-line; the shared field is unchanged', () => {
  const screen = readFileSync('src/features/settings/account-groups-screen.tsx', 'utf8');
  const field = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');
  const strings = readFileSync('src/shared/i18n/strings.ts', 'utf8');
  const customRows =
    screen.split('state.customGroups.map')[1]?.split('</SwipeableCustomGroupRow>')[0];
  const builtInRows =
    screen.split('BUILT_IN_ACCOUNT_GROUPS.map')[1]?.split('state.customGroups.map')[0];
  assert.ok(customRows);
  assert.ok(builtInRows);
  assert.match(screen, /maxLength=\{MAX_CUSTOM_GROUP_NAME_LENGTH\}/);
  assert.match(screen, /multiline=\{false\}/);
  assert.match(screen, /returnKeyType="done"/);
  assert.match(customRows, /<AppText numberOfLines=\{1\}>\{group.name\}<\/AppText>/);
  assert.doesNotMatch(builtInRows, /numberOfLines=\{1\}/);
  assert.match(strings, /accountGroupsInvalidName: 'Use a name with 1–20 characters/);
  assert.match(field, /TextInputProps/);
  assert.doesNotMatch(field, /maxLength=\{20\}|multiline=\{false\}/);
});
