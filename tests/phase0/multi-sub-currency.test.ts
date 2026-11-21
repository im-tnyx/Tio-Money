import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  DEFAULT_CURRENCY_PREFERENCES,
  MAX_SUB_CURRENCIES,
  addSubCurrency,
  removeSubCurrency,
  withMainCurrency,
  type CurrencyCode,
} from '../../src/shared/currency/currency-preference';
import { formatReferenceRate, parseReferenceRate } from '../../src/data/market/fx-reference-rates';

test('TM-CUR-028: five distinct Subs, one-tap addition and per-code removal', () => {
  const first = addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  const second = addSubCurrency(first, 'EUR');
  assert.deepEqual(second.subCodes, ['USD', 'EUR']);
  assert.equal(addSubCurrency(second, 'USD'), second);
  const five = ['USD', 'EUR', 'GBP', 'JPY', 'AED'].reduce(
    (current, code) => addSubCurrency(current, code as CurrencyCode),
    DEFAULT_CURRENCY_PREFERENCES,
  );
  assert.equal(MAX_SUB_CURRENCIES, 5);
  assert.equal(five.subCodes.length, 5);
  assert.throws(() => addSubCurrency(five, 'CAD'), /limit/);
  assert.throws(() => addSubCurrency(second, 'INR'), /differ/);
  assert.deepEqual(removeSubCurrency(five, 'EUR').subCodes, ['USD', 'GBP', 'JPY', 'AED']);
  assert.deepEqual(withMainCurrency(five, 'USD').subCodes, ['EUR', 'GBP', 'JPY', 'AED']);
  assert.equal(withMainCurrency(five, 'USD').subCode, 'EUR');
});

test('TM-FX-013: pair-checked FX, six decimals, and screen-only display', () => {
  const reference = parseReferenceRate('USD', 'INR', {
    date: '2026-11-20',
    base: 'USD',
    quote: 'INR',
    rate: 92.680507,
  });
  assert.ok(reference);
  assert.equal(formatReferenceRate(reference), 'USD 1.00 = INR 92.680507');
  for (const invalid of [
    { base: 'EUR', quote: 'INR', date: '2026-11-20', rate: 92 },
    { base: 'USD', quote: 'INR', date: '2026-11-20', rate: -1 },
    { base: 'USD', quote: 'INR', date: '2026-11-20', rate: Infinity },
    { base: 'USD', quote: 'INR', date: 'invalid', rate: 92 },
  ]) {
    assert.equal(parseReferenceRate('USD', 'INR', invalid), null);
  }
  const fx = readFileSync('src/data/market/fx-reference-rates.ts', 'utf8');
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  assert.match(fx, /api\.frankfurter\.dev\/v2\/rate\//);
  assert.match(screen, /formatReferenceRate\(item.rate\)/);
  assert.match(screen, /currencyFxSource/);
  assert.match(screen, /currencyFxUnavailable/);
  assert.doesNotMatch(sheet, /rate\.date|formatReferenceRate|currencyFxSource/);
  assert.doesNotMatch(fx, /accountId|transactionId|ledger|balance/);
});

test('TM-CUR-031: no extra labels above or below the Sub Currency card', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  assert.doesNotMatch(screen, /t\('currencyMain'\)|t\('currencySubCount'\)/);
  assert.doesNotMatch(screen, /t\('currencyFxDisclosure'\)/);
  assert.match(screen, /state.selected.map/);
  assert.match(screen, /formatReferenceRate\(item.rate\)/);
  assert.match(screen, /currencyFxSource/);
  assert.match(screen, /state.error/);
  assert.match(sheet, /currencySubCount/);
});

test('TM-CUR-032: Pencil edit shows left destructive minus icon, not right Remove text', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const row = screen.slice(screen.indexOf('state.selected.map('));
  const removeAction = row.indexOf("onPress={() => onAction({ type: 'remove', code: item.code })}");
  const details = row.indexOf('<View style={{ flex: 1, gap: theme.space.xxs }}>');
  assert.ok(removeAction >= 0 && details >= 0);
  assert.ok(removeAction < details, 'remove icon must be left of the currency details');
  assert.match(row, /\{state.editing \? \(/);
  assert.match(row, /accessibilityRole="button"/);
  assert.match(row, /accessibilityLabel=\{t\('currencyRemoveSub'\) \+ ': ' \+ item.code\}/);
  assert.match(row, /minHeight: theme.buttons.minimumHeight/);
  assert.match(row, /minWidth: theme.buttons.minimumHeight/);
  assert.match(row, /<Circle cx="12" cy="12" r="11" fill=\{theme.colors.expense\} \/>/);
  assert.match(row, /d="M7 12h10"/);
  assert.doesNotMatch(row, /\{t\('currencyRemoveSub'\)\}/);
  assert.match(screen, /type: state.editing \? 'edit.cancel' : 'back'/);
});
