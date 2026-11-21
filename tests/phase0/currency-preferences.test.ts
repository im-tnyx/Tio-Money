import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY_PREFERENCES,
  isCurrencyCode,
  isCurrencyPreferences,
  parseCurrencyPreferences,
  withMainCurrency,
  withSubCurrency,
  type CurrencyCode,
} from '../../src/shared/currency/currency-preference';
import { en } from '../../src/shared/i18n/strings';

test('TM-CUR-001: default Main INR, Sub None and valid curated ISO display codes', () => {
  assert.deepEqual(DEFAULT_CURRENCY_PREFERENCES, { mainCode: 'INR', subCode: null });
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

test('TM-CUR-002/003: optional different Sub, collision auto-clears', () => {
  const selected = withSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  assert.deepEqual(selected, { mainCode: 'INR', subCode: 'USD' });
  assert.deepEqual(withMainCurrency(selected, 'USD'), { mainCode: 'USD', subCode: null });
  assert.deepEqual(withMainCurrency(selected, 'EUR'), { mainCode: 'EUR', subCode: 'USD' });
  assert.deepEqual(withSubCurrency(selected, null), DEFAULT_CURRENCY_PREFERENCES);
  assert.throws(() => withSubCurrency(selected, 'INR'), /differ/);
});

test('TM-CUR-004: unknown and malformed persisted preferences do not become active', () => {
  for (const bad of [
    undefined,
    { mainCode: 'USD' },
    { mainCode: 'INR', subCode: 'INR' },
    { mainCode: 'ABC', subCode: null },
    { mainCode: 'USD', subCode: 'ABC' },
    { mainCode: {}, subCode: null },
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

test('TM-CUR-007: More currency bottom sheet remains dumb, English and accessible', () => {
  const screen = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/currency-sheet.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-more-view-model.ts', 'utf8');
  assert.match(screen, /onAction\(\{ type: 'currency.open' \}\)/);
  assert.match(screen, /<CurrencySheet state=\{state\} onAction=\{onAction\} \/>/);
  assert.match(sheet, /<AppBottomSheet/);
  assert.match(sheet, /accessibilityRole="radiogroup"/);
  assert.match(sheet, /accessibilityRole="radio"/);
  assert.match(sheet, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(sheet, /onDismiss=\{\(\) => onAction\(\{ type: 'currency.dismiss' \}\)\}/);
  assert.doesNotMatch(screen + sheet, /useState|useEffect|Storage\.|router\.push|SQLite|fetch\(/);
  assert.match(vm, /setCurrencySheetVisible/);
  assert.equal(en.currencyMain, 'Main Currency');
  assert.equal(en.currencySub, 'Sub Currency');
  assert.equal(en.currencyNone, 'None');
  assert.match(en.currencyNoRates, /not available yet/);
});

test('TM-CUR-008: currency preference is not FX, migration or a second ledger', () => {
  const migration = readFileSync('src/data/sqlite/migrations.ts', 'utf8');
  const currency = readFileSync('src/shared/currency/currency-preference.ts', 'utf8');
  const store = readFileSync('src/data/preferences/currency-preference-store.ts', 'utf8');
  const sheet = readFileSync('src/features/settings/currency-sheet.tsx', 'utf8');
  assert.match(migration, /version: 1/);
  assert.doesNotMatch(migration, /fx_rate_cache|currency_preferences/);
  assert.doesNotMatch(
    currency + store + sheet,
    /https?:\/\/|fetch\(|openDatabase|PRAGMA|insert into/,
  );
});
