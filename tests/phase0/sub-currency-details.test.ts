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
import { formatSubCurrencyDetailPreview } from '../../src/shared/currency/sub-currency-detail-preview';

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
    subPreview: '$ 1.00',
    mainPreview: '₹ 92.680507',
  });
  const changed = withSubCurrencyDisplay(preferences, 'USD', {
    unitPosition: 'end',
    decimalDigits: 0,
  });
  assert.deepEqual(formatSubCurrencyDetailPreview(changed, 'USD', 92.680507), {
    subPreview: '1 $',
    mainPreview: '₹ 92.680507',
  });
  assert.equal(formatSubCurrencyDetailPreview(changed, 'USD', null).mainPreview, '₹ —');
  assert.equal(formatSubCurrencyDetailPreview(changed, 'USD', Number.NaN).mainPreview, '₹ —');
});

test('TM-CUR-036: tap opens detail sheet with refresh and decimal choices', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/sub-currency-detail-sheet.tsx', 'utf8');
  const add = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  const controller = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const provider = readFileSync('src/shared/currency/currency-provider.tsx', 'utf8');
  assert.match(screen, /type: 'detail.open', code: item.code/);
  assert.match(screen, /disabled=\{state.editing\}/);
  assert.match(screen, /<SubCurrencyDetailSheet state=\{state\} onAction=\{onAction\} \/>/);
  assert.match(sheet, /<AppBottomSheet/);
  assert.match(sheet, /<CurrencyUnitPositionControl/);
  assert.match(sheet, /type: 'detail.refresh'/);
  assert.match(sheet, /type: 'detail.position.select'/);
  assert.match(sheet, /type: 'detail.decimal.open'/);
  assert.match(sheet, /type: 'detail.decimal.select'/);
  assert.match(sheet, /state.detailMode === 'decimal'/);
  assert.match(sheet, /accessibilityRole="radio"/);
  assert.doesNotMatch(add, /currencyFxExchangeRate|detail.refresh|CurrencyUnitPositionControl/);
  assert.match(controller, /getReferenceRate\(detailCode, main\)/);
  assert.match(controller, /setRefreshingPair\(pair\)/);
  assert.match(controller, /generation !== refreshRequest.current/);
  assert.match(controller, /updateSubDisplay\(detailCode/);
  assert.match(provider, /withSubCurrencyDisplay\(current.current, code, patch\)/);
});

test('TM-CUR-039: USD and INR labels align above their values, with stable setting columns', () => {
  const sheet = readFileSync('src/features/settings/sub-currency-detail-sheet.tsx', 'utf8');
  const appText = readFileSync('src/shared/ui/app-text.tsx', 'utf8');
  const overviewStart = sheet.indexOf('      {detail && !decimalMode ? (');
  const preview = sheet.slice(
    overviewStart,
    sheet.indexOf('backgroundColor: theme.colors.card', overviewStart),
  );
  assert.match(preview, /\{detail.label\}/);
  assert.match(preview, /\{detail.subPreview\}/);
  assert.match(preview, /\{state.mainCode\}/);
  assert.match(preview, /\{detail.mainPreview\}/);
  assert.equal((preview.match(/flex: 0\.9/g) ?? []).length, 2);
  assert.equal((preview.match(/flex: 1\.25/g) ?? []).length, 2);
  assert.equal((preview.match(/width: theme.space.xxl/g) ?? []).length, 2);
  assert.match(preview, /numberOfLines=\{1\}/);
  assert.match(preview, /adjustsFontSizeToFit/);
  assert.match(preview, /minimumFontScale=\{0\.6\}/);
  assert.equal((sheet.match(/width: '34%'/g) ?? []).length, 3);
  assert.match(appText, /adjustsFontSizeToFit=\{adjustsFontSizeToFit\}/);
  assert.match(appText, /minimumFontScale=\{minimumFontScale\}/);
});
