import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { BUILT_IN_ACCOUNT_GROUPS } from '../../src/features/settings/account-group-templates';
import { en } from '../../src/shared/i18n/strings';

const read = (path: string) => readFileSync(path, 'utf8');

test('Settings uses reusable token-owned top bar and preserves all five bottom tabs', () => {
  const more = read('src/features/settings/more-screen.tsx');
  const bar = read('src/shared/ui/app-top-bar.tsx');
  const tabs = read('src/shared/navigation/root-destinations.ts');
  assert.match(more, /<AppTopBar title=\{t\('settings'\)\} \/>/);
  assert.doesNotMatch(more, /<AppText variant="title">\{t\('more'\)\}<\/AppText>/);
  assert.doesNotMatch(more, /<AppText variant="section">\{t\('settings'\)\}<\/AppText>/);
  assert.match(more, /<AppText variant="section">\{t\('accountSettings'\)\}<\/AppText>/);
  assert.match(more, /<AppText variant="section">\{t\('appearance'\)\}<\/AppText>/);
  assert.match(more, /<AppText variant="section">\{t\('currency'\)\}<\/AppText>/);
  assert.match(bar, /height: theme\.navigation\.topBarHeight/);
  assert.match(bar, /width=\{theme\.iconRoles\.topBar\}/);
  assert.match(bar, /backgroundColor: theme\.colors\.card/);
  assert.match(bar, /textAlign: 'center'/);
  assert.match(tabs, /label: 'More'/);
});

test('Account Groups route is controller-driven and shows seven informational built-ins', () => {
  const ids = BUILT_IN_ACCOUNT_GROUPS.map((g) => g.id);
  assert.deepEqual(ids, [
    'cash',
    'bank',
    'credit-card',
    'loan',
    'insurance',
    'investment',
    'wallet',
  ]);
  assert.equal(ids.length, new Set(ids).size);
  assert.deepEqual(
    BUILT_IN_ACCOUNT_GROUPS.map((g) => en[g.label]),
    ['Cash', 'Bank Account', 'Credit Card', 'Loan', 'Insurance', 'Investment', 'Wallet'],
  );
  assert.match(en.accountGroupInsuranceInfo, /not a cash account/);
  const route = read('src/features/settings/account-groups-route.tsx');
  const screen = read('src/features/settings/account-groups-screen.tsx');
  const page = read('src/app/account-groups.tsx');
  const more = read('src/features/settings/more-screen.tsx');
  const vm = read('src/features/settings/use-more-view-model.ts');
  assert.match(page, /AccountGroupsRoute/);
  assert.match(route, /useRouter\(\)/);
  assert.match(route, /useAccountGroupsViewModel/);
  assert.match(route, /router\.back\(\)/);
  assert.match(vm, /router\.push\('\/account-groups'\)/);
  assert.match(more, /onAction\(\{ type: 'account\.groups\.open' \}\)/);
  assert.match(screen, /<AppTopBar/);
  assert.match(screen, /BUILT_IN_ACCOUNT_GROUPS\.map/);
  assert.doesNotMatch(screen, /accountGroupsReadOnly|Built-in templates/);
  assert.match(screen, /actions=\{actions\}/);
  assert.match(screen, /state\.showDescriptions \?/);
  assert.match(screen, /state\.customGroups\.map/);
  assert.match(screen, /<AppBottomSheet/);
  assert.match(screen, /<AppTextField/);
  assert.match(screen, /<ActionButton/);
  assert.equal((screen.match(/<ActionButton/g) ?? []).length, 1);
  assert.match(screen, /label=\{t\('accountGroupsSave'\)\}/);
  assert.doesNotMatch(screen, /<TextInput/);
  assert.doesNotMatch(
    screen,
    /useRouter|useState|useEffect|sqlite|fetch\(|Storage\.|createAccount|saveAccount/i,
  );
});

test('Account Groups visibility icon matches current state and list is flush under top bar', () => {
  const screen = read('src/features/settings/account-groups-screen.tsx');
  const prefs = read('src/features/settings/account-group-preferences.ts');
  const bar = read('src/shared/ui/app-top-bar.tsx');
  assert.match(prefs, /showDescriptions: false/);
  assert.match(screen, /icon: state\.showDescriptions \? 'eye' : 'eye-off'/);
  assert.match(
    screen,
    /state\.showDescriptions \? 'accountGroupsHideDescriptions' : 'accountGroupsShowDescriptions'/,
  );
  assert.match(screen, /selected: state\.showDescriptions/);
  assert.match(screen, /onPress: \(\) => onAction\(\{ type: 'descriptions\.toggle' \}\)/);
  const list = screen.slice(
    screen.indexOf('<ScrollView'),
    screen.indexOf('BUILT_IN_ACCOUNT_GROUPS.map'),
  );
  assert.match(list, /<ScrollView/);
  assert.match(list, /paddingBottom: theme\.space\.xxxl/);
  assert.doesNotMatch(list, /paddingTop:/);
  assert.doesNotMatch(list, /borderTopWidth:/);
  assert.match(bar, /borderBottomWidth: theme\.navigation\.borderWidth/);
});

test('Theme is a display-copy change, not a new preference or finance feature', () => {
  const screen = read('src/features/settings/more-screen.tsx');
  const sheet = read('src/features/settings/appearance-sheet.tsx');
  const contract = read('src/features/settings/more-contract.ts');
  assert.match(screen, /accessibilityLabel=\{t\('theme'\)\}/);
  assert.match(sheet, /title=\{t\('theme'\)\}/);
  assert.match(sheet, /dismissAccessibilityLabel=\{t\('closeTheme'\)\}/);
  assert.match(sheet, /APPEARANCE_OPTIONS\.map/);
  assert.match(contract, /appearance\.select/);
  assert.doesNotMatch(screen + sheet, /useRouter|useState|Storage\.|openDatabase|supabase/);
});
