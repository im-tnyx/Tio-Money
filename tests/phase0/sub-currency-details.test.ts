import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  DEFAULT_CURRENCY_PREFERENCES,
  addSubCurrency,
  isCurrencyPreferences,
  parseCurrencyPreferences,
  removeSubCurrency,
  resolveSubCurrencyDisplay,
  withMainCurrency,
  withSubCurrencyDisplay,
} from '../../src/shared/currency/currency-preference';
import {
  formatSubCurrencyDetailCaption,
  formatSubCurrencyDetailPreview,
  formatSubCurrencyNumberExample,
} from '../../src/shared/currency/sub-currency-detail-preview';
import {
  formatSubCurrencyDecimalExample,
  stepSubCurrencyDecimalDigits,
} from '../../src/features/settings/sub-currency-decimal-step';
import { classifySubCurrencyRefresh } from '../../src/features/settings/sub-currency-refresh-feedback';

test('TM-CUR-034: individual Sub display changes persist without touching Main display', () => {
  const base = addSubCurrency(addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD'), 'EUR');
  const edited = withSubCurrencyDisplay(base, 'USD', {
    unitPosition: 'end',
    decimalDigits: 3,
  });
  assert.equal(edited.subDisplay?.USD?.unitPosition, 'end');
  assert.equal(edited.subDisplay?.USD?.decimalDigits, 3);
  assert.equal(resolveSubCurrencyDisplay(edited, 'EUR').unitPosition, 'front');
  assert.deepEqual(edited.display, base.display);
  assert.equal(isCurrencyPreferences(edited), true);
  assert.deepEqual(parseCurrencyPreferences(edited), edited);
  assert.equal(
    isCurrencyPreferences({ ...edited, subDisplay: { GBP: edited.subDisplay?.USD } }),
    false,
  );
  assert.equal(
    isCurrencyPreferences({ ...edited, subDisplay: { USD: { decimalDigits: 9 } } }),
    false,
  );
  assert.throws(() => withSubCurrencyDisplay(base, 'GBP', { unitPosition: 'front' }), /not saved/);
  const remaining = removeSubCurrency(edited, 'USD');
  assert.equal(remaining.subDisplay?.USD, undefined);
  const collision = withMainCurrency(edited, 'USD');
  assert.equal(collision.subDisplay?.USD, undefined);
  assert.deepEqual(collision.subCodes, ['EUR']);
});

test('TM-CUR-035: Sub detail preview shows symbols and exact six-decimal FX only', () => {
  const preferences = addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  assert.deepEqual(formatSubCurrencyDetailPreview(preferences, 'USD', 92.680507), {
    subPreview: 'US' + String.fromCharCode(36) + ' 1.00',
    mainPreview: '₹ 92.680507',
  });
  const changed = withSubCurrencyDisplay(preferences, 'USD', {
    unitPosition: 'end',
    decimalDigits: 0,
  });
  assert.deepEqual(formatSubCurrencyDetailPreview(changed, 'USD', 92.680507), {
    subPreview: '1 US' + String.fromCharCode(36),
    mainPreview: '₹ 92.680507',
  });
  assert.equal(formatSubCurrencyDetailPreview(changed, 'USD', null).mainPreview, '₹ —');
  assert.equal(formatSubCurrencyDetailPreview(changed, 'USD', Number.NaN).mainPreview, '₹ —');
});

test('TM-CUR-036: saved Sub opens a native detail screen with Main-style option sheets', () => {
  const list = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const detail = readFileSync('src/features/settings/sub-currency-detail-screen.tsx', 'utf8');
  const options = readFileSync(
    'src/features/settings/sub-currency-detail-option-sheet.tsx',
    'utf8',
  );
  const add = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  const controller = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const contract = readFileSync('src/features/settings/sub-currency-contract.ts', 'utf8');
  const provider = readFileSync('src/shared/currency/currency-provider.tsx', 'utf8');

  assert.match(list, /type: 'detail.open', code: item.code/);
  assert.doesNotMatch(list, /SubCurrencyDetailSheet/);
  assert.match(list, /<SubCurrencyOptionSheet/);
  assert.match(detail, /<SafeAreaView/);
  assert.match(detail, /<ScrollView/);
  assert.match(detail, /<CurrencyUnitPositionControl/);
  assert.match(detail, /type: 'detail.refresh'/);
  assert.match(detail, /<ActivityIndicator size="small"/);
  assert.match(detail, /detail.refreshing \? \(/);
  assert.match(detail, /accessibilityLiveRegion="polite"/);
  assert.match(detail, /\{detail.refreshStatus\}/);
  assert.match(detail, /detail.refreshError/);
  assert.match(detail, /<SubCurrencyDetailOptionSheet/);
  assert.doesNotMatch(detail, /<AppBottomSheet|AppSegmentedActionControl/);
  assert.match(options, /<AppBottomSheet/);
  assert.match(options, /visible=\{detail !== null && kind !== null\}/);
  assert.match(options, /accessibilityRole="radiogroup"/);
  assert.match(options, /accessibilityRole="radio"/);
  assert.match(options, /accessibilityState=\{\{ checked \}\}/);
  assert.match(options, /onDismiss=\{\(\) => onAction\(\{ type: 'detail.options.dismiss' \}\)\}/);
  assert.match(controller, /setRefreshResult\(null\)/);
  assert.match(controller, /classifySubCurrencyRefresh\(previousRate, quote\)/);
  assert.match(controller, /generation !== refreshRequest.current/);
  assert.match(controller, /refreshResult\?\.pair === detailCode/);
  assert.match(controller, /refreshRate\(detailCode, main\)/);
  assert.doesNotMatch(controller, /getReferenceRate\(/);
  assert.match(controller, /setRefreshingPair\(pair\)/);
  assert.match(controller, /updateSubDisplay\(detailCode/);
  assert.match(contract, /readonly detailSheetKind: 'decimal' \| 'format' \| null/);
  assert.match(provider, /withSubCurrencyDisplay\(current.current, code, patch\)/);
  assert.doesNotMatch(add, /currencyFxExchangeRate|detail.refresh|CurrencyUnitPositionControl/);
});

test('TM-CUR-039: dedicated Sub screen aligns full-width preview and settings', () => {
  const detail = readFileSync('src/features/settings/sub-currency-detail-screen.tsx', 'utf8');
  const appText = readFileSync('src/shared/ui/app-text.tsx', 'utf8');
  assert.match(detail, /\{detail.label\}/);
  assert.match(detail, /\{detail.subPreview\}/);
  assert.match(detail, /\{state.mainCode\}/);
  assert.match(detail, /\{state.mainLabel\}/);
  assert.match(detail, /\{detail.mainPreview\}/);
  assert.match(detail, /\{detail.rateDate\}/);
  assert.match(detail, /minWidth: theme.navigation.origin/);
  assert.match(detail, /width: theme.space.xxl/);
  assert.match(detail, /adjustsFontSizeToFit/);
  assert.match(detail, /backgroundColor: theme.colors.canvas/);
  assert.match(detail, /minHeight: theme.buttons.minimumHeight/);
  assert.match(appText, /minimumFontScale=\{minimumFontScale\}/);
});

test('TM-CUR-040: short USD detail caption and its special symbol are presentation-only', () => {
  assert.equal(
    formatSubCurrencyDetailCaption('USD'),
    'USD - USA (US' + String.fromCharCode(36) + ')',
  );
  assert.equal(formatSubCurrencyDetailCaption('EUR'), 'EUR – Euro Area (€)');
  const sheet = readFileSync('src/features/settings/sub-currency-detail-screen.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  assert.match(sheet, /minimumFontScale=\{0\.7\}/);
  assert.match(sheet, /numberOfLines=\{1\}/);
  assert.match(vm, /formatSubCurrencyDetailCaption\(selectedDetail.code\)/);
  assert.match(vm, /return formatSubCurrencyDetailCaption\(code\)/);
  assert.match(vm, /mainLabel: mainConfigured \? currencyLabel\(preferences.mainCode\)/);
  assert.match(vm, /selected.push\(\{\s*code,\s*label: currencyLabel\(code\),/);
});

test('TM-CUR-041: full-screen Sub preview uses shared semantic card colors', () => {
  const detail = readFileSync('src/features/settings/sub-currency-detail-screen.tsx', 'utf8');
  assert.match(detail, /backgroundColor: theme.colors.card/);
  assert.match(detail, /borderTopWidth: theme.navigation.borderWidth/);
  assert.match(detail, /borderBottomWidth: theme.navigation.borderWidth/);
  assert.doesNotMatch(detail, /backgroundColor: theme.colors.elevated/);
  assert.doesNotMatch(detail, /#[0-9A-Fa-f]{6}/);
});

test('TM-CUR-042: Sub Decimal sheet preserves 0–3 precision only for saved Sub', () => {
  assert.deepEqual(
    ([0, 1, 2, 3] as const).map((digits) => formatSubCurrencyDecimalExample(digits)),
    ['1', '1.0', '1.00', '1.000'],
  );
  assert.equal(stepSubCurrencyDecimalDigits(0, -1), 0);
  assert.equal(stepSubCurrencyDecimalDigits(0, 1), 1);
  assert.equal(stepSubCurrencyDecimalDigits(1, 1), 2);
  assert.equal(stepSubCurrencyDecimalDigits(2, 1), 3);
  assert.equal(stepSubCurrencyDecimalDigits(3, 1), 3);
  assert.equal(stepSubCurrencyDecimalDigits(3, -1), 2);

  const initial = addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  const changed = withSubCurrencyDisplay(initial, 'USD', { decimalDigits: 3 });
  assert.equal(resolveSubCurrencyDisplay(changed, 'USD').decimalDigits, 3);
  assert.deepEqual(changed.display, initial.display);
  assert.deepEqual(formatSubCurrencyDetailPreview(changed, 'USD', 92.680507), {
    subPreview: 'US' + String.fromCharCode(36) + ' 1.000',
    mainPreview: '₹ 92.680507',
  });
  const main = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  const mainSheet = readFileSync('src/features/settings/main-currency-option-sheet.tsx', 'utf8');
  const options = readFileSync(
    'src/features/settings/sub-currency-detail-option-sheet.tsx',
    'utf8',
  );
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  assert.match(main, /<MainCurrencyOptionSheet/);
  assert.match(mainSheet, /<AppBottomSheet/);
  assert.match(options, /currencyDecimalNone/);
  assert.match(options, /currencyDecimalOne/);
  assert.match(options, /currencyDecimalTwo/);
  assert.match(options, /currencyDecimalThree/);
  assert.match(options, /detail.decimalDigits === item.value/);
  assert.match(options, /type: 'detail.decimal.select', value: item.value/);
  assert.match(vm, /updateSubDisplay\(detailCode, \{ decimalDigits: action.value \}\)/);
  assert.doesNotMatch(main + mainSheet, /sub-currency-decimal-step|detail\.decimal\.step/);
});

test('TM-CUR-043: refresh feedback distinguishes new, unchanged, and first valid quote', () => {
  const oldQuote = { base: 'USD', quote: 'INR', rate: 82.5, date: '2026-11-20' } as const;
  assert.equal(classifySubCurrencyRefresh(null, oldQuote), 'updated');
  assert.equal(classifySubCurrencyRefresh(undefined, oldQuote), 'updated');
  assert.equal(classifySubCurrencyRefresh(oldQuote, { ...oldQuote }), 'unchanged');
  assert.equal(
    classifySubCurrencyRefresh(oldQuote, { ...oldQuote, date: '2026-11-21' }),
    'updated',
  );
  assert.equal(classifySubCurrencyRefresh(oldQuote, { ...oldQuote, rate: 82.6 }), 'updated');
  assert.equal(classifySubCurrencyRefresh(oldQuote, { ...oldQuote, quote: 'USD' }), 'updated');
});

test('TM-CUR-046: Sub detail keeps one dated source row and fine refresh icon stroke', () => {
  const sheet = readFileSync('src/features/settings/sub-currency-detail-screen.tsx', 'utf8');
  const contract = readFileSync('src/features/settings/sub-currency-contract.ts', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const tokens = readFileSync('src/shared/theme/component-tokens.ts', 'utf8');
  assert.match(sheet, /\{t\('currencyFxSource'\)\} · \{detail.rateDate\}/);
  assert.match(sheet, /numberOfLines=\{1\}[\s\S]*?\{t\('currencyFxSource'\)\}/);
  assert.doesNotMatch(sheet, /detail.rateFetchedLabel/);
  assert.doesNotMatch(contract + vm, /rateFetchedLabel/);
  assert.match(vm, /rateFetchedAt: fetchedAt/);
  assert.match(sheet, /strokeWidth=\{theme.icons.fineStroke\}/);
  assert.match(tokens, /fineStroke: size.dp1_5/);
  assert.match(sheet, /gap: theme.space.xs,[\s\S]*?currencyFxExchangeRate/);
  assert.match(sheet, /minWidth: theme.buttons.minimumHeight/);
  assert.match(sheet, /accessibilityLabel=\{t\(/);
});

test('TM-CUR-049: successful FX check feedback disappears after three seconds', () => {
  const controller = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const detail = readFileSync('src/features/settings/sub-currency-detail-screen.tsx', 'utf8');
  assert.match(controller, /const REFRESH_CONFIRMATION_MS = 3000/);
  assert.match(controller, /useEffect\(\(\) => \{/);
  assert.match(controller, /if \(!refreshResult\) return/);
  assert.match(controller, /const timer = setTimeout\(\(\) => \{/);
  assert.match(controller, /\}, REFRESH_CONFIRMATION_MS\)/);
  assert.match(controller, /return \(\) => clearTimeout\(timer\)/);
  assert.match(controller, /\}, \[refreshResult\]\)/);
  assert.match(
    controller,
    /setRefreshResult\(\(current\) => \(current === refreshResult \? null : current\)\)/,
  );
  assert.match(controller, /setRefreshResult\(null\)/);
  assert.match(controller, /setRefreshError\(t\('currencyFxRefreshFailed'\)\)/);
  assert.match(detail, /\{detail.refreshStatus \? \(/);
  assert.match(detail, /accessibilityLiveRegion="polite"/);
});

test('TM-CUR-053: per-Sub number grouping matches Main policy without Main mutations', () => {
  const base = addSubCurrency(addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD'), 'EUR');
  assert.equal(formatSubCurrencyNumberExample(base, 'USD', 1234567.89), 'US$ 1,234,567.89');
  const lakhs = withSubCurrencyDisplay(base, 'USD', { grouping: 'indian' });
  assert.equal(formatSubCurrencyNumberExample(lakhs, 'USD', 1234567.89), 'US$ 12,34,567.89');
  const millions = withSubCurrencyDisplay(lakhs, 'USD', { grouping: 'international' });
  assert.equal(formatSubCurrencyNumberExample(millions, 'USD', 1234567.89), 'US$ 1,234,567.89');
  const plain = withSubCurrencyDisplay(millions, 'USD', { grouping: 'none' });
  assert.equal(formatSubCurrencyNumberExample(plain, 'USD', 1234567.89), 'US$ 1234567.89');
  assert.equal(formatSubCurrencyNumberExample(plain, 'EUR', 1234567.89), '€ 1,234,567.89');
  assert.deepEqual(plain.display, base.display);
  const inrSub = addSubCurrency(withMainCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD'), 'INR');
  assert.equal(formatSubCurrencyNumberExample(inrSub, 'INR', 1234567.89), '₹ 12,34,567.89');
  assert.equal(isCurrencyPreferences(plain), true);
  assert.deepEqual(parseCurrencyPreferences(plain), plain);
  assert.equal(removeSubCurrency(plain, 'USD').subDisplay?.USD, undefined);
});

test('TM-CUR-054: legacy Sub grouping values remain safe', () => {
  const saved = addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  const legacy = {
    ...saved,
    subDisplay: { USD: { unitPosition: 'end', decimalDigits: 2 } },
  } as const;
  assert.equal(isCurrencyPreferences(legacy), true);
  assert.deepEqual(parseCurrencyPreferences(legacy), legacy);
  assert.equal(formatSubCurrencyNumberExample(legacy, 'USD', 1234567.89), '1,234,567.89 US$');
  const edited = withSubCurrencyDisplay(legacy, 'USD', { grouping: 'indian' });
  assert.equal(edited.subDisplay?.USD?.grouping, 'indian');
  assert.equal(edited.subDisplay?.USD?.unitPosition, 'end');
  assert.equal(edited.subDisplay?.USD?.decimalDigits, 2);
  const invalidGrouping = { ...legacy.subDisplay.USD, grouping: 'bogus' };
  const invalid = { ...legacy, subDisplay: { USD: invalidGrouping } };
  assert.equal(isCurrencyPreferences(invalid), false);
  assert.deepEqual(parseCurrencyPreferences(invalid), DEFAULT_CURRENCY_PREFERENCES);
  assert.throws(
    () => withSubCurrencyDisplay(saved, 'USD', { grouping: 'bogus' as 'indian' }),
    /Invalid Sub Currency display/,
  );
});

test('TM-CUR-055: Format is a separate selected-radio sheet, not an accordion', () => {
  const screen = readFileSync('src/features/settings/sub-currency-detail-screen.tsx', 'utf8');
  const options = readFileSync(
    'src/features/settings/sub-currency-detail-option-sheet.tsx',
    'utf8',
  );
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const contract = readFileSync('src/features/settings/sub-currency-contract.ts', 'utf8');
  const domain = readFileSync('src/shared/currency/currency-preference.ts', 'utf8');

  assert.match(screen, /type: 'detail.options.open', sheet: 'decimal'/);
  assert.match(screen, /type: 'detail.options.open', sheet: 'format'/);
  assert.match(screen, /expanded=\{state.detailSheetKind === 'format'\}/);
  assert.doesNotMatch(screen, /formatExpanded|numberFormatChoices\.map/);
  assert.match(options, /currencyMillionsExample/);
  assert.match(options, /currencyLakhsExample/);
  assert.match(options, /currencyNoFormatExample/);
  assert.match(options, /type: 'detail.format.select'/);
  assert.match(options, /accessibilityRole="radiogroup"/);
  assert.match(options, /accessibilityRole="radio"/);
  assert.match(options, /accessibilityState=\{\{ checked \}\}/);
  assert.match(options, /minHeight: theme.buttons.minimumHeight/);
  assert.match(vm, /const \[detailSheetKind, setDetailSheetKind\] = useState/);
  assert.match(vm, /case 'detail.options.open'/);
  assert.match(vm, /case 'detail.options.dismiss'/);
  assert.match(vm, /case 'detail.format.select'/);
  assert.match(vm, /setDetailSheetKind\(null\)/);
  assert.match(vm, /updateSubDisplay\(detailCode, \{ grouping: action.value \}\)/);
  assert.match(vm, /resolveNumberGrouping\(detailCode, subDisplay\?\.grouping \?\? 'auto'\)/);
  assert.match(contract, /readonly detailSheetKind: 'decimal' \| 'format' \| null/);
  assert.match(domain, /readonly grouping\?: NumberGrouping/);
});

test('TM-CUR-056: saved Sub selection pushes validated native stack detail route', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const listRoute = readFileSync('src/features/settings/sub-currency-route.tsx', 'utf8');
  const detailPage = readFileSync('src/app/currency/sub-detail.tsx', 'utf8');
  const detailRoute = readFileSync(
    'src/features/settings/sub-currency-detail-route.tsx',
    'utf8',
  );
  const detailScreen = readFileSync(
    'src/features/settings/sub-currency-detail-screen.tsx',
    'utf8',
  );
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  assert.match(screen, /type: 'detail.open', code: item.code/);
  assert.match(screen, /onAccessibilityAction/);
  assert.match(listRoute, /gestureEnabled: !cardTouchActive/);
  assert.match(detailPage, /<SubCurrencyDetailRoute/);
  assert.match(detailRoute, /useLocalSearchParams/);
  assert.match(detailRoute, /isCurrencyCode\(code\)/);
  assert.match(detailRoute, /useSubCurrencyViewModel\(selectedCode\)/);
  assert.match(detailScreen, /type: 'detail.dismiss'/);
  assert.match(
    vm,
    /router.push\(\{ pathname: '\/currency\/sub-detail', params: \{ code: action.code \} \}\)/,
  );
  assert.match(vm, /selected.find\(\(item\) => item.code === detailCode\)/);
  assert.match(vm, /preferences.subCodes.includes\(detailCode\)/);
  assert.doesNotMatch(screen, /<SubCurrencyDetailSheet/);
  assert.doesNotMatch(detailScreen, /AppSegmentedActionControl|<AppBottomSheet/);
});
