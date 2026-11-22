import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY_DISPLAY,
  DEFAULT_CURRENCY_PREFERENCES,
  withCurrencyDisplay,
  isCurrencyCode,
  isCurrencyPreferences,
  parseCurrencyPreferences,
  withMainCurrency,
  withSubCurrency,
  type CurrencyCode,
} from '../../src/shared/currency/currency-preference';
import { en } from '../../src/shared/i18n/strings';
import {
  formatCurrencyExample,
  getCurrencyLabel,
} from '../../src/shared/currency/currency-display-preview';

test('TM-CUR-001: default Main INR, Sub None and valid curated ISO display codes', () => {
  assert.deepEqual(DEFAULT_CURRENCY_PREFERENCES, {
    mainCode: 'INR',
    subCode: null,
    subCodes: [],
    display: DEFAULT_CURRENCY_DISPLAY,
  });
  assert.deepEqual(parseCurrencyPreferences(null), DEFAULT_CURRENCY_PREFERENCES);
  assert.deepEqual(parseCurrencyPreferences('invalid'), DEFAULT_CURRENCY_PREFERENCES);
  assert.ok(CURRENCY_OPTIONS.length >= 10);
  assert.equal(
    new Set(CURRENCY_OPTIONS.map((option) => option.code)).size,
    CURRENCY_OPTIONS.length,
  );
  assert.ok(CURRENCY_OPTIONS.every((option) => /^[A-Z]{3}$/.test(option.code)));
  assert.equal(isCurrencyCode('INR'), true);
  assert.equal(isCurrencyCode('ZZZ'), false);
});

test('TM-CUR-002/003: Sub collision, v1 alias and safe Main change', () => {
  const selected = withSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  assert.deepEqual(selected.subCodes, ['USD']);
  assert.equal(selected.subCode, 'USD');
  assert.deepEqual(withMainCurrency(selected, 'USD').subCodes, []);
  assert.equal(withMainCurrency(selected, 'USD').subCode, null);
  assert.deepEqual(withMainCurrency(selected, 'EUR').subCodes, ['USD']);
  assert.deepEqual(withSubCurrency(selected, null), DEFAULT_CURRENCY_PREFERENCES);
  assert.throws(() => withSubCurrency(selected, 'INR'), /differ/);
});

test('TM-CUR-004: invalid persisted preference data is not activated', () => {
  for (const bad of [
    undefined,
    { mainCode: 'USD' },
    { mainCode: 'INR', subCode: 'INR' },
    { mainCode: 'ABC', subCode: null },
    { mainCode: 'USD', subCode: 'ABC' },
    { mainCode: {}, subCode: null },
    { mainCode: 'INR', subCode: 'USD', subCodes: ['USD', 'USD'] },
    { mainCode: 'INR', subCode: 'USD', subCodes: ['USD', 'INR'] },
    { mainCode: 'INR', subCode: 'USD', subCodes: ['USD', 'EUR', 'GBP', 'JPY', 'AED', 'CAD'] },
    { mainCode: 'INR', subCode: null, subCodes: ['USD'] },
  ]) {
    assert.equal(isCurrencyPreferences(bad), false);
    assert.deepEqual(parseCurrencyPreferences(bad), DEFAULT_CURRENCY_PREFERENCES);
  }
  assert.throws(
    () => withMainCurrency(DEFAULT_CURRENCY_PREFERENCES, 'ZZZ' as CurrencyCode),
    /Invalid/,
  );
  assert.throws(
    () => withSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'ZZZ' as CurrencyCode),
    /Invalid/,
  );
  assert.deepEqual(parseCurrencyPreferences({ mainCode: 'JPY', subCode: 'KWD' }), {
    mainCode: 'JPY',
    subCode: 'KWD',
    subCodes: ['KWD'],
    display: DEFAULT_CURRENCY_DISPLAY,
  });
});

test('TM-CUR-005: preferences persist only through a versioned local adapter', () => {
  const storage = readFileSync('src/data/preferences/currency-preference-store.ts', 'utf8');
  const provider = readFileSync('src/shared/currency/currency-provider.tsx', 'utf8');
  assert.match(storage, /expo-sqlite\/kv-store/);
  assert.match(storage, /tio-money\.currency-preferences\.v1/);
  assert.match(storage, /Storage\.getItemSync/);
  assert.match(storage, /Storage\.setItemSync/);
  assert.match(storage, /isCurrencyPreferences/);
  assert.match(provider, /store\.write\(next\)/);
  assert.ok(provider.indexOf('store.write(next)') < provider.indexOf('current.current = next'));
  assert.match(provider, /currencySaveError/);
  assert.match(provider, /currencyLoadError/);
  assert.doesNotMatch(storage + provider, /fetch\(|supabase|exchangeRate|getRate/);
});

test('TM-CUR-006: one global context reaches future Accounts/Transactions/Stats', () => {
  const root = readFileSync('src/app/_layout.tsx', 'utf8');
  const provider = readFileSync('src/shared/currency/currency-provider.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-more-view-model.ts', 'utf8');
  assert.match(root, /<CurrencyPreferencesProvider store=\{currencyPreferenceStore\}>/);
  assert.match(provider, /export function useCurrencySettings/);
  assert.match(vm, /useCurrencySettings\(\)/);
  assert.doesNotMatch(root, /useState|useEffect|fetch\(/);
});

test('TM-CUR-007: FX display on Sub screen; app-scoped fetching and swipe Delete', () => {
  const more = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const picker = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const route = readFileSync('src/app/currency/sub.tsx', 'utf8');
  assert.match(more, /onAction\(\{ type: 'currency.sub.open' \}\)/);
  assert.match(route, /<SubCurrencyRoute \/>/);
  assert.match(screen, /<HeaderAction/);
  assert.match(screen, /label=\{t\('currencyAddSub'\)\}/);
  assert.match(screen, /accessibilityLabel=\{t\('currencyPageBack'\)\}/);
  assert.match(screen, /type: 'back'/);
  assert.doesNotMatch(screen, /pencil|state\.editing|currencyCancelEdit|currencyEditSub/);
  assert.match(screen, /formatReferenceRate\(item.rate\)/);
  assert.doesNotMatch(screen, /item.rate.date|currencyFxSource/);
  assert.match(picker, /<AppBottomSheet/);
  assert.match(picker, /accessibilityRole="button"/);
  assert.match(picker, /type: 'select', code: option\.code/);
  assert.doesNotMatch(picker, /formatReferenceRate|currencyFxSource/);
  assert.match(vm, /if \(addSubCurrency\(action.code\)\)/);
  assert.match(vm, /case 'back'/);
  assert.doesNotMatch(vm, /case 'edit.cancel'|case 'edit.toggle'|setEditing/);
  assert.doesNotMatch(screen + picker, /useRouter\(|Storage\.|fetch\(/);
  assert.equal(en.currencyMain, 'Main Currency');
  assert.equal(en.currencySub, 'Sub Currency');
});
test('TM-CUR-008: currency preference is not FX, migration or a second ledger', () => {
  const migration = readFileSync('src/data/sqlite/migrations.ts', 'utf8');
  const currency = readFileSync('src/shared/currency/currency-preference.ts', 'utf8');
  const store = readFileSync('src/data/preferences/currency-preference-store.ts', 'utf8');
  const subScreen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  assert.match(migration, /version: 1/);
  assert.doesNotMatch(migration, /fx_rate_cache|currency_preferences/);
  assert.doesNotMatch(
    currency + store + subScreen,
    /https?:\/\/|fetch\(|openDatabase|PRAGMA|insert into/,
  );
});

test('TM-CUR-009: front/end unit position persists without modifying monetary inputs', () => {
  const front = DEFAULT_CURRENCY_PREFERENCES;
  const end = withCurrencyDisplay(front, { unitPosition: 'end' });
  assert.equal(getCurrencyLabel(front), 'INR – India (₹)');
  assert.equal(formatCurrencyExample(front, 1), '₹ 1.00');
  assert.equal(formatCurrencyExample(end, 1), '1.00 ₹');
  assert.equal(formatCurrencyExample(end, -1234.5), '-1,234.50 ₹');
  assert.equal(front.display.unitPosition, 'front');
});

test('TM-CUR-010: format presets, decimal precision and native minor-digit defaults', () => {
  const main = DEFAULT_CURRENCY_PREFERENCES;
  assert.equal(formatCurrencyExample(main, 1234567.89), '₹ 12,34,567.89');
  const international = withCurrencyDisplay(main, { grouping: 'international' });
  assert.equal(formatCurrencyExample(international, 1234567.89), '₹ 1,234,567.89');
  const rounded = withCurrencyDisplay(main, { decimalDigits: 0 });
  assert.equal(formatCurrencyExample(rounded, 1234567.89), '₹ 12,34,568');
  assert.equal(formatCurrencyExample(withMainCurrency(main, 'JPY'), 1), '¥ 1');
  assert.equal(formatCurrencyExample(withMainCurrency(main, 'KWD'), 1), 'د.ك 1.000');
});

test('TM-CUR-011: Millions / Lakhs / No Format control grouping, not financial amounts', () => {
  const main = DEFAULT_CURRENCY_PREFERENCES;
  assert.equal(formatCurrencyExample(main, 1234567.89), '₹ 12,34,567.89');
  const millions = withCurrencyDisplay(main, { grouping: 'international' });
  assert.equal(formatCurrencyExample(millions, 1234567.89), '₹ 1,234,567.89');
  const none = withCurrencyDisplay(main, { grouping: 'none' });
  assert.equal(formatCurrencyExample(none, 1234567.89), '₹ 1234567.89');
  assert.equal(formatCurrencyExample(none, -1234567.89), '-₹ 1234567.89');
  assert.throws(() => withCurrencyDisplay(main, { grouping: 'invalid' as 'indian' }), /Invalid/);
});

test('TM-CUR-012: More Currency section and dedicated Main Currency screen are dumb', () => {
  const more = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const screen = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/main-currency-option-sheet.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-main-currency-view-model.ts', 'utf8');
  const route = readFileSync('src/app/currency/main.tsx', 'utf8');
  assert.match(more, /onAction\(\{ type: 'currency.main.open' \}\)/);
  assert.match(more, /onAction\(\{ type: 'currency.sub.open' \}\)/);
  assert.match(screen, /\{t\('currencyMain'\)\}/);
  assert.match(screen, /label=\{t\('currencyChange'\)\}/);
  assert.match(screen, /type: 'position.select'/);
  const position = readFileSync('src/features/settings/currency-unit-position-control.tsx', 'utf8');
  assert.match(screen, /<CurrencyUnitPositionControl/);
  const segmented = readFileSync('src/shared/ui/app-segmented-control.tsx', 'utf8');
  assert.match(position, /<AppSegmentedControl/);
  assert.match(segmented, /accessibilityRole="radiogroup"/);
  assert.match(segmented, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(screen, /<MainCurrencyOptionSheet/);
  const radio = readFileSync('src/features/settings/currency-radio-choice-sheet.tsx', 'utf8');
  assert.match(sheet, /<CurrencyRadioChoiceSheet/);
  assert.match(radio, /<AppBottomSheet/);
  assert.match(radio, /accessibilityRole="radio"/);
  assert.match(radio, /accessibilityState=\{\{ checked: choice.selected \}\}/);
  assert.match(vm, /updateDisplay\(/);
  assert.match(route, /<MainCurrencyRoute \/>/);
  assert.doesNotMatch(screen + sheet, /useState|useEffect|useRouter|SQLite|Storage\.|fetch\(/);
});

test('TM-CUR-013: icon-only Back, shared icon sizes and reusable sheet shell', () => {
  const screen = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  const options = readFileSync('src/features/settings/main-currency-option-sheet.tsx', 'utf8');
  const subScreen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const tokens = readFileSync('src/shared/theme/component-tokens.ts', 'utf8');

  assert.match(screen, /accessibilityLabel=\{t\('currencyPageBack'\)\}/);
  assert.match(screen, /width=\{theme\.iconRoles\.topBar\}/);
  assert.match(screen, /height=\{theme\.iconRoles\.topBar\}/);
  assert.doesNotMatch(screen, /<AppText>\{t\('currencyPageBack'\)\}<\/AppText>/);
  assert.match(tokens, /topBar: iconTokens\.size/);
  assert.match(tokens, /bottomSheet: iconTokens\.size/);
  const radio = readFileSync('src/features/settings/currency-radio-choice-sheet.tsx', 'utf8');
  assert.match(options, /<CurrencyRadioChoiceSheet/);
  assert.match(radio, /<AppBottomSheet/);
  assert.doesNotMatch(subScreen, /<AppBottomSheet/);
  assert.match(radio, /theme\.iconRoles\.bottomSheet/);
  assert.match(subScreen, /theme\.iconRoles\.topBar/);
});

test('TM-CUR-014: image-style Front/End pill selector shares themed semantic tokens', () => {
  const control = readFileSync('src/shared/ui/app-segmented-control.tsx', 'utf8');
  const unit = readFileSync('src/features/settings/currency-unit-position-control.tsx', 'utf8');
  const theme = readFileSync('src/shared/theme/theme-provider.tsx', 'utf8');
  const tokens = readFileSync('src/shared/theme/component-tokens.ts', 'utf8');
  const colors = readFileSync('src/shared/theme/tokens.ts', 'utf8');

  assert.match(unit, /<AppSegmentedControl/);
  assert.match(control, /accessibilityRole="radiogroup"/);
  assert.match(control, /accessibilityRole="radio"/);
  assert.match(control, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(control, /flex: 1/);
  assert.match(control, /theme\.segmentedControl\.radius/);
  assert.match(control, /theme\.colors\.segmentedTrack/);
  assert.match(control, /theme\.colors\.brand/);
  assert.match(control, /theme\.colors\.brandText/);
  assert.match(tokens, /minimumOptionHeight: buttonTokens\.minimumHeight/);
  assert.match(tokens, /radius: radius\.pill/);
  assert.match(theme, /segmentedControl: segmentedControlTokens/);
  assert.match(colors, /segmentedTrack: '#272A31'/);
  assert.match(colors, /segmentedSelected: '#62666F'/);
  assert.doesNotMatch(control + unit, /#[0-9a-fA-F]{3,8}|useState|useEffect|fetch\(|Storage\./);
});

test('TM-CUR-015: preview without extra card, edge-to-edge common settings group', () => {
  const screen = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  assert.match(screen, /<CurrencySettingsCard state=\{state\} onAction=\{onAction\} \/>/);
  assert.match(screen, /borderTopWidth: theme\.navigation\.borderWidth/);
  assert.match(screen, /borderBottomWidth: theme\.navigation\.borderWidth/);
  assert.match(screen, /last=\{index === state\.rows\.length - 1\}/);
  const oldMargin = /marginHorizontal: theme\.space\.lg,\s*backgroundColor: theme\.colors\.card/;
  assert.doesNotMatch(screen, oldMargin);
  assert.doesNotMatch(screen, /\{t\('currencyDisplayFormat'\)\}/);
  assert.doesNotMatch(screen, /\{t\('currencyLargePreview'\)\}/);
});

test('TM-CUR-016: unit position is a compact right-side selector in the same row', () => {
  const screen = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  const unit = readFileSync('src/features/settings/currency-unit-position-control.tsx', 'utf8');
  const segmented = readFileSync('src/shared/ui/app-segmented-control.tsx', 'utf8');
  const tokens = readFileSync('src/shared/theme/component-tokens.ts', 'utf8');
  assert.match(screen, /justifyContent: 'space-between'/);
  assert.match(screen, /<CurrencyUnitPositionControl/);
  assert.match(unit, /<AppSegmentedControl\s+compact/);
  assert.match(segmented, /compact \? theme\.segmentedControl\.compactWidth/);
  assert.match(tokens, /compactWidth: size\.dp100 \+ size\.dp20/);
  assert.match(tokens, /minimumOptionHeight: buttonTokens\.minimumHeight/);
  assert.match(tokens, /compactOptionHeight: size\.dp24/);
  assert.match(segmented, /theme\.segmentedControl\.compactOptionHeight/);
});

test('TM-CUR-017: top bar removes double padding and preserves true center', () => {
  const screen = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  assert.match(screen, /sideWidth = theme\.buttons\.minimumHeight \+ theme\.space\.xxxl/);
  assert.match(screen, /paddingLeft: theme\.space\.sm/);
  assert.match(screen, /width: sideWidth/);
  assert.match(screen, /accessibilityLabel=\{t\('currencyPageBack'\)\}/);
  assert.match(screen, /width=\{theme\.iconRoles\.topBar\}/);
  assert.doesNotMatch(screen, /sideWidth = theme\.buttons\.minimumHeight \* 2/);
});

test('TM-CUR-018: None decimal option displays exactly 1, never 1.0', () => {
  const vm = readFileSync('src/features/settings/use-main-currency-view-model.ts', 'utf8');
  const main = DEFAULT_CURRENCY_PREFERENCES;
  const noDecimals = withCurrencyDisplay(main, { decimalDigits: 0 });
  assert.equal(formatCurrencyExample(noDecimals, 1), '₹ 1');
  assert.equal(formatCurrencyExample(noDecimals, 1.49), '₹ 1');
  assert.equal(formatCurrencyExample(noDecimals, 1.5), '₹ 2');
  const previewWithDecimals = (decimalDigits: 0 | 1 | 2 | 3) =>
    formatCurrencyExample(withCurrencyDisplay(main, { decimalDigits }), 1);
  assert.equal(previewWithDecimals(1), '₹ 1.0');
  assert.equal(previewWithDecimals(2), '₹ 1.00');
  assert.equal(previewWithDecimals(3), '₹ 1.000');
  assert.equal(en.currencyDecimalNone, 'None');
  assert.equal(en.currencyDecimalOne, '1.0');
  assert.equal(en.currencyDecimalTwo, '1.00');
  assert.equal(en.currencyDecimalThree, '1.000');
  assert.match(vm, /value: 0/);
  assert.match(vm, /currencyDecimalNone/);
  assert.doesNotMatch(vm, /\{ label: '1\.0', value: 0 \}/);
});

test('TM-CUR-019: default Auto follows INR lakhs and other currencies millions', () => {
  const main = DEFAULT_CURRENCY_PREFERENCES;
  assert.equal(main.display.grouping, 'auto');
  assert.equal(formatCurrencyExample(main, 1234567.89), '₹ 12,34,567.89');
  const dollars = withMainCurrency(main, 'USD');
  assert.equal(dollars.display.grouping, 'auto');
  assert.equal(formatCurrencyExample(dollars, 1234567.89), '$ 1,234,567.89');
  const manualIndian = withCurrencyDisplay(dollars, { grouping: 'indian' });
  assert.equal(formatCurrencyExample(manualIndian, 1234567.89), '$ 12,34,567.89');
  const manualMillions = withCurrencyDisplay(main, { grouping: 'international' });
  assert.equal(formatCurrencyExample(manualMillions, 1234567.89), '₹ 1,234,567.89');
  const euro = withMainCurrency(manualIndian, 'EUR');
  assert.equal(euro.display.grouping, 'auto');
  assert.equal(formatCurrencyExample(euro, 1234567.89), '€ 1,234,567.89');
  const rupeesAgain = withMainCurrency(euro, 'INR');
  assert.equal(rupeesAgain.display.grouping, 'auto');
  assert.equal(formatCurrencyExample(rupeesAgain, 1234567.89), '₹ 12,34,567.89');
  const dollarsAfterOverride = withMainCurrency(manualMillions, 'USD');
  assert.equal(dollarsAfterOverride.display.grouping, 'auto');
  assert.equal(formatCurrencyExample(dollarsAfterOverride, 1234567.89), '$ 1,234,567.89');
  // Re-selecting the current currency must not silently erase a manual choice.
  assert.equal(withMainCurrency(manualIndian, 'USD').display.grouping, 'indian');
  // Currency changes must not reset the separate unit-position or decimal settings.
  const custom = withCurrencyDisplay(main, {
    unitPosition: 'end',
    decimalDigits: 1,
    grouping: 'none',
  });
  const changed = withMainCurrency(custom, 'EUR');
  assert.deepEqual(changed.display, {
    unitPosition: 'end',
    decimalDigits: 1,
    grouping: 'auto',
  });
});

test('TM-CUR-020: selected segment uses theme brand and is wider by 11.1 percent', () => {
  const control = readFileSync('src/shared/ui/app-segmented-control.tsx', 'utf8');
  const tokens = readFileSync('src/shared/theme/component-tokens.ts', 'utf8');
  const vm = readFileSync('src/features/settings/use-main-currency-view-model.ts', 'utf8');
  assert.match(control, /theme\.colors\.brand\s*:\s*theme\.colors\.segmentedTrack/);
  assert.match(control, /theme\.colors\.brandText\s*:\s*theme\.colors\.segmentedText/);
  assert.match(tokens, /compactWidth: size\.dp100 \+ size\.dp20/);
  assert.match(vm, /resolveNumberGrouping\(preferences\.mainCode, d\.grouping\)/);
  assert.doesNotMatch(vm, /key: 'auto'|currencyAutoLakhs|currencyAutoMillions/);
  assert.match(vm, /selected: effectiveGrouping === 'indian'/);
  assert.match(vm, /selected: effectiveGrouping === 'international'/);
});

test('TM-CUR-021: decimal sheet contains only None and 1.0 through 1.000', () => {
  const vm = readFileSync('src/features/settings/use-main-currency-view-model.ts', 'utf8');
  assert.doesNotMatch(vm, /label: t\('currencyDefaultDigits'\), value: 'currency'/);
  assert.match(vm, /selected: displayedDigits === item.value/);
  assert.match(vm, /CURRENCY_OPTIONS\.find/);
  assert.equal(en.currencyDecimalNone, 'None');
  assert.equal(en.currencyDecimalOne, '1.0');
  assert.equal(en.currencyDecimalTwo, '1.00');
  assert.equal(en.currencyDecimalThree, '1.000');
});

test('TM-CUR-022: Main Currency top bar extends behind status icons with safe 50dp actions', () => {
  const screen = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  const tokens = readFileSync('src/shared/theme/component-tokens.ts', 'utf8');
  assert.match(tokens, /topBarHeight: size\.dp50/);
  assert.match(screen, /edges=\{\['top', 'left', 'right'\]\}/);
  assert.match(screen, /style=\{\{ flex: 1, backgroundColor: theme\.colors\.card \}\}/);
  assert.match(screen, /height: theme\.navigation\.topBarHeight/);
  assert.match(
    screen,
    /<ScrollView\s+style=\{\{ flex: 1, backgroundColor: theme\.colors\.canvas \}\}/,
  );
  assert.match(screen, /accessibilityLabel=\{t\('currencyPageBack'\)\}/);
  assert.match(screen, /label=\{t\('currencyChange'\)\}/);
});

test('TM-CUR-023: Change uses the reusable compact top-right button', () => {
  const screen = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  const reusableButton = readFileSync('src/shared/ui/action-button.tsx', 'utf8');
  const card = screen.slice(
    screen.indexOf('function CurrencySettingsCard('),
    screen.indexOf('/** Presentation only:'),
  );
  const header = screen.slice(screen.indexOf('/** Presentation only:'));
  assert.doesNotMatch(card, /label=\{t\('currencyMain'\)\}/);
  assert.doesNotMatch(card, /value=\{t\('currencyChange'\)\}/);
  assert.match(card, /<CurrencyUnitPositionControl/);
  assert.match(card, /state\.rows\.map/);
  assert.match(header, /<ActionButton/);
  assert.match(header, /label=\{t\('currencyChange'\)\}/);
  assert.match(header, /accessibilityLabel=\{t\('currencyChange'\)\}/);
  assert.match(header, /variant="ghost"/);
  assert.match(header, /\scompact\s/);
  assert.match(header, /sheet: 'currency'/);
  assert.equal(header.match(/width: sideWidth/g)?.length, 2);
  assert.match(header, /height: theme\.navigation\.topBarHeight/);
  assert.match(reusableButton, /compact \? theme\.space\.sm : theme\.space\.lg/);
  assert.match(reusableButton, /minHeight: theme\.buttons\.minimumHeight/);
});
test('TM-CUR-024: Format sheet has three choices and resolves the currency default', () => {
  const vm = readFileSync('src/features/settings/use-main-currency-view-model.ts', 'utf8');
  const start = vm.indexOf("} else if (sheetKind === 'grouping') {");
  const groupingChoices = vm.slice(start, vm.indexOf('    return {', start));
  assert.ok(start >= 0);
  assert.equal(groupingChoices.match(/key: '/g)?.length, 3);
  for (const mode of ['international', 'indian', 'none']) {
    assert.ok(groupingChoices.includes("key: '" + mode + "'"));
    assert.ok(groupingChoices.includes("selected: effectiveGrouping === '" + mode + "'"));
  }
  assert.doesNotMatch(groupingChoices, /key: 'auto'|label: autoLabel/);
  assert.doesNotMatch(vm, /currencyAutoLakhs|currencyAutoMillions/);
  assert.match(vm, /resolveNumberGrouping\(preferences\.mainCode, d\.grouping\)/);
  assert.match(vm, /value:\s*effectiveGrouping === 'indian'/);
});

test('TM-CUR-026: add saves on one tap and closes only on success', () => {
  const provider = readFileSync('src/shared/currency/currency-provider.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const picker = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  assert.match(provider, /addSubCurrency\(code: CurrencyCode\): boolean/);
  assert.match(provider, /removeSubCurrency\(code: CurrencyCode\): boolean/);
  assert.ok(provider.indexOf('store.write(next)') < provider.indexOf('return true'));
  assert.match(provider, /return false/);
  assert.match(vm, /if \(addSubCurrency\(action.code\)\)/);
  assert.match(vm, /removeSubCurrency\(action.code\)/);
  assert.match(screen, /currencyRemoveSub/);
  assert.match(picker, /state.error/);
});
