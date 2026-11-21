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

test('TM-CUR-036: Sub detail uses inline +/- precision without another sheet', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/sub-currency-detail-sheet.tsx', 'utf8');
  const add = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  const controller = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const contract = readFileSync('src/features/settings/sub-currency-contract.ts', 'utf8');
  const provider = readFileSync('src/shared/currency/currency-provider.tsx', 'utf8');
  assert.match(screen, /type: 'detail.open', code: item.code/);
  assert.match(screen, /<SubCurrencyDetailSheet state=\{state\} onAction=\{onAction\} \/>/);
  assert.match(sheet, /<AppBottomSheet/);
  assert.match(sheet, /<CurrencyUnitPositionControl/);
  assert.match(sheet, /type: 'detail.refresh'/);
  assert.match(sheet, /<ActivityIndicator size="small"/);
  assert.match(sheet, /detail.refreshing \? \(/);
  assert.match(sheet, /accessibilityLiveRegion="polite"/);
  assert.match(sheet, /\{detail.refreshStatus\}/);
  assert.match(sheet, /detail.refreshError/);
  assert.match(controller, /setRefreshResult\(null\)/);
  assert.match(controller, /classifySubCurrencyRefresh\(previousRate, quote\)/);
  assert.match(controller, /generation !== refreshRequest.current/);
  assert.match(controller, /refreshResult\?\.pair === detailCode/);

  assert.match(sheet, /type: 'detail.position.select'/);
  assert.match(sheet, /type: 'detail.decimal.step', delta: -1/);
  assert.match(sheet, /type: 'detail.decimal.step', delta: 1/);
  assert.match(sheet, /<AppSegmentedActionControl/);
  assert.match(sheet, /label: t\('currencyDecimalDecrease'\)/);
  assert.match(sheet, /label: t\('currencyDecimalIncrease'\)/);
  assert.match(sheet, /disabled: detail.decimalDigits === 0/);
  assert.match(sheet, /disabled: detail.decimalDigits === 3/);
  const decimalRow = sheet.slice(sheet.indexOf("{t('currencyDecimals')}"));
  const valueIndex = decimalRow.indexOf('{detail.decimalLabel}');
  const actionIndex = decimalRow.indexOf('<AppSegmentedActionControl');
  const minusIndex = decimalRow.indexOf("key: 'decrease'");
  const plusIndex = decimalRow.indexOf("key: 'increase'");
  assert.ok(valueIndex >= 0 && valueIndex < actionIndex && actionIndex < minusIndex);
  assert.ok(minusIndex < plusIndex);
  assert.match(decimalRow, /style=\{\{ flex: 1, textAlign: 'right' \}\}/);
  const actionControl = readFileSync('src/shared/ui/app-segmented-control.tsx', 'utf8');
  const actionStart = actionControl.indexOf('export function AppSegmentedActionControl');
  const action = actionControl.slice(actionStart);
  assert.ok(actionStart >= 0);
  assert.match(action, /width: theme.segmentedControl.compactWidth/);
  assert.match(action, /minHeight: theme.segmentedControl.compactOptionHeight/);
  assert.match(action, /theme.segmentedControl.compactHitSlop/);
  assert.match(action, /theme.colors.segmentedTrack/);
  assert.match(action, /theme.colors.segmentedSelected/);
  assert.match(action, /accessibilityRole="button"/);
  assert.doesNotMatch(action, /accessibilityRole="radio"/);

  assert.doesNotMatch(sheet, /detail\.decimal\.open|detail\.decimal\.back|decimalMode|radiogroup/);
  assert.doesNotMatch(
    contract + controller,
    /detailMode|detail\.decimal\.open|detail\.decimal\.back/,
  );
  assert.doesNotMatch(add, /currencyFxExchangeRate|detail.refresh|CurrencyUnitPositionControl/);
  assert.match(controller, /refreshRate\(detailCode, main\)/);
  assert.doesNotMatch(controller, /getReferenceRate\(/);
  assert.match(controller, /setRefreshingPair\(pair\)/);
  assert.match(controller, /generation !== refreshRequest.current/);
  assert.match(controller, /stepSubCurrencyDecimalDigits\(effective, action.delta\)/);
  assert.match(controller, /updateSubDisplay\(detailCode/);
  assert.match(provider, /withSubCurrencyDisplay\(current.current, code, patch\)/);
});

test('TM-CUR-039: aligned captions and compact, right-aligned Sub settings', () => {
  const sheet = readFileSync('src/features/settings/sub-currency-detail-sheet.tsx', 'utf8');
  const appText = readFileSync('src/shared/ui/app-text.tsx', 'utf8');
  const previewStart = sheet.indexOf('      {detail ? (');
  const preview = sheet.slice(
    previewStart,
    sheet.indexOf('borderTopWidth: theme.navigation.borderWidth', previewStart),
  );
  assert.match(preview, /\{detail.label\}/);
  assert.match(preview, /\{detail.subPreview\}/);
  assert.match(preview, /\{state.mainCode\}/);
  assert.match(preview, /\{state.mainLabel\}/);
  assert.match(preview, /\{detail.mainPreview\}/);
  assert.match(preview, /\{detail.rateDate\}/);
  assert.equal((preview.match(/flex: 0\.9/g) ?? []).length, 2);
  assert.equal((preview.match(/flex: 1\.25/g) ?? []).length, 2);
  assert.equal((preview.match(/width: theme.space.xxl/g) ?? []).length, 2);
  assert.match(preview, /adjustsFontSizeToFit/);
  assert.equal((sheet.match(/width: '34%'/g) ?? []).length, 3);
  assert.match(sheet, /alignItems: 'flex-end'/);
  assert.match(sheet, /style=\{\{ flex: 1, textAlign: 'right' \}\}/);
  assert.doesNotMatch(sheet, /paddingVertical: theme.space.md/);
  assert.match(appText, /minimumFontScale=\{minimumFontScale\}/);
});

test('TM-CUR-040: short USD detail caption and its special symbol are presentation-only', () => {
  assert.equal(
    formatSubCurrencyDetailCaption('USD'),
    'USD - USA (US' + String.fromCharCode(36) + ')',
  );
  assert.equal(formatSubCurrencyDetailCaption('EUR'), 'EUR – Euro Area (€)');
  const sheet = readFileSync('src/features/settings/sub-currency-detail-sheet.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  assert.match(sheet, /minimumFontScale=\{0\.7\}/);
  assert.match(sheet, /numberOfLines=\{1\}/);
  assert.match(vm, /formatSubCurrencyDetailCaption\(selectedDetail.code\)/);
  assert.match(vm, /return formatSubCurrencyDetailCaption\(code\)/);
  assert.match(vm, /mainLabel: mainConfigured \? currencyLabel\(preferences.mainCode\)/);
  assert.match(vm, /selected.push\(\{ code, label: currencyLabel\(code\)/);
});

test('TM-CUR-041: the preview and settings use one semantic card surface', () => {
  const sheet = readFileSync('src/features/settings/sub-currency-detail-sheet.tsx', 'utf8');
  assert.equal((sheet.match(/backgroundColor: theme.colors.card/g) ?? []).length, 2);
  assert.doesNotMatch(sheet, /backgroundColor: theme.colors.elevated/);
  assert.match(sheet, /borderTopWidth: theme.navigation.borderWidth/);
  assert.doesNotMatch(sheet, /#[0-9A-Fa-f]{6}/);
});

test('TM-CUR-042: inline Sub-only decimal controls respect 0–3 boundaries and persistence', () => {
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
  assert.match(main, /<MainCurrencyOptionSheet/);
  assert.match(mainSheet, /<AppBottomSheet/);
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
  const sheet = readFileSync('src/features/settings/sub-currency-detail-sheet.tsx', 'utf8');
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
