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
  assert.equal(en.settings, 'Settings');
  assert.equal(en.appearance, 'Appearance');
  const screen = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/appearance-sheet.tsx', 'utf8');
  assert.match(screen, /accessibilityRole="button"/);
  assert.match(sheet, /accessibilityRole="radio"/);
  assert.match(sheet, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(sheet, /APPEARANCE_OPTIONS\.map/);
  assert.doesNotMatch(screen, /useState|setState|setItemSync|openDatabase/);
  assert.doesNotMatch(sheet, /useState|setState|setItemSync|openDatabase/);
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

test('More uses a full-width Appearance row and ViewModel-owned accessible bottom sheet', () => {
  const screen = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/appearance-sheet.tsx', 'utf8');
  const viewModel = readFileSync('src/features/settings/use-more-view-model.ts', 'utf8');
  const contract = readFileSync('src/features/settings/more-contract.ts', 'utf8');
  const route = readFileSync('src/features/settings/more-route.tsx', 'utf8');

  assert.match(screen, /<AppText variant="section">\{t\('settings'\)\}<\/AppText>/);
  assert.match(screen, /width: '100%'/);
  assert.match(screen, /borderRadius: theme\.navigation\.origin/);
  assert.match(screen, /paddingHorizontal: theme\.space\.lg/);
  assert.match(screen, /M12 2a10 10 0 1 0/);
  assert.match(screen, /onAction\(\{ type: 'appearance.open' \}\)/);
  assert.match(screen, /d="m9 18 6-6-6-6"/);
  assert.match(screen, /<AppearanceSheet state=\{state\} onAction=\{onAction\} \/>/);
  assert.doesNotMatch(screen, /APPEARANCE_OPTIONS\.map/);

  assert.match(sheet, /<Modal/);
  assert.match(sheet, /visible=\{state\.appearanceSheetVisible\}/);
  assert.match(sheet, /animationType="slide"/);
  assert.match(sheet, /onRequestClose=\{dismiss\}/);
  assert.match(sheet, /accessibilityViewIsModal/);
  assert.match(sheet, /onPress=\{dismiss\}/);
  assert.match(sheet, /borderTopLeftRadius: theme\.navigation\.origin/);
  assert.match(sheet, /borderTopRightRadius: theme\.navigation\.origin/);
  assert.match(sheet, /<AppText variant="section" style=\{\{ flex: 1 \}\}>/);
  assert.doesNotMatch(sheet, /textAlign: 'center'/);
  assert.doesNotMatch(sheet, /width: theme\.space\.xxxl/);
  assert.doesNotMatch(sheet, /marginTop: theme\.space\.sm/);
  assert.match(sheet, /minHeight: theme\.buttons\.minimumHeight/);
  assert.match(sheet, /paddingVertical: theme\.space\.md/);
  assert.doesNotMatch(sheet, /paddingVertical: theme\.space\.lg/);
  assert.match(sheet, /paddingHorizontal: theme\.space\.lg/);
  assert.match(sheet, /borderBottomWidth: theme\.navigation\.borderWidth/);
  assert.match(sheet, /borderBottomColor: theme\.colors\.border/);
  assert.match(sheet, /d="M18 6 6 18 M6 6l12 12"/);
  assert.match(sheet, /fill="none"/);
  assert.match(sheet, /accessibilityLabel=\{t\('closeAppearance'\)\}/);
  assert.doesNotMatch(sheet, /t\('appearanceHint'\)/);
  assert.doesNotMatch(sheet, /<AppText>\{t\('close'\)\}<\/AppText>/);
  assert.match(sheet, /accessibilityRole="radiogroup"/);
  assert.match(sheet, /<AppearanceOptionIcon name=\{value\}/);
  assert.match(sheet, /color=\{theme\.colors\.secondaryText\}/);
  assert.match(sheet, /showDivider=\{index > 0\}/);
  assert.match(sheet, /borderTopWidth: showDivider \? theme\.navigation\.borderWidth/);
  assert.match(sheet, /selected=\{state\.appearance === option\}/);

  assert.match(contract, /appearanceSheetVisible: boolean/);
  assert.match(contract, /type: 'appearance.open'/);
  assert.match(contract, /type: 'appearance.dismiss'/);
  assert.match(viewModel, /useState\(false\)/);
  assert.match(viewModel, /setAppearanceSheetVisible\(true\)/);
  assert.match(viewModel, /setAppearanceSheetVisible\(false\)/);
  assert.match(viewModel, /selectPreference\(action\.preference\)/);
  assert.match(route, /<MoreScreen state=\{state\} onAction=\{onAction\} \/>/);
  assert.doesNotMatch(screen + sheet, /useState|setState|Storage\.|appearanceStore|router\.push/);
});

test('appearance options use official SVGs and trailing radio controls', () => {
  const icon = readFileSync('src/features/settings/appearance-option-icon.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/appearance-sheet.tsx', 'utf8');
  const origin = readFileSync('src/shared/assets/google-material-icons/README.md', 'utf8');
  const appearanceSvg = JSON.parse(
    readFileSync('src/features/settings/appearance-option-svg.json', 'utf8'),
  );

  for (const [name, sourceName] of [
    ['system', 'routine'],
    ['dark', 'dark_mode'],
    ['light', 'light_mode'],
  ] as const) {
    const svgPath = `src/shared/assets/google-material-icons/${sourceName}.svg`;
    const svg = readFileSync(svgPath, 'utf8');
    assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" /);
    assert.match(svg, /viewBox="0 -960 960 960"/);
    assert.equal(appearanceSvg[name], svg, `${name} matches official SVG source`);
    assert.ok(origin.includes(`${sourceName}_wght200_24px.svg`));
  }
  assert.match(icon, /appearance-option-svg\.json/);
  assert.match(icon, /iconRoleSizes\.bottomSheet/);
  assert.match(icon, /importantForAccessibility="no-hide-descendants"/);
  assert.ok(sheet.indexOf('<AppearanceOptionIcon') < sheet.indexOf('flex: 1'));
  assert.ok(sheet.indexOf('flex: 1') < sheet.indexOf('borderColor: selected ?'));
  assert.doesNotMatch(sheet, /<AppText variant="caption" muted>/);
  assert.equal(en.appearanceSystem, 'System Mode');
  assert.equal(en.appearanceLight, 'Light Mode');
  assert.equal(en.appearanceDark, 'Dark Mode');
  assert.doesNotMatch(sheet + icon, /useState|setAppearanceSheetVisible|Storage\./);
  assert.doesNotMatch(sheet + icon, /appearanceStore/);
});
