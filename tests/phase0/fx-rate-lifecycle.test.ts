import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { parseCachedReferenceRate } from '../../src/data/market/fx-reference-rate-cache-contract';
import {
  DEFAULT_CURRENCY_PREFERENCES,
  addSubCurrency,
  removeSubCurrency,
  withCurrencyDisplay,
  withMainCurrency,
  withSubCurrencyDisplay,
} from '../../src/shared/currency/currency-preference';
import { activeFxPairs, fxPairKey } from '../../src/shared/currency/fx-rate-lifecycle';

test('TM-FX-014: no Sub means zero eligible FX pairs on launch, revisit or removal', () => {
  const none = activeFxPairs(
    DEFAULT_CURRENCY_PREFERENCES.mainCode,
    DEFAULT_CURRENCY_PREFERENCES.subCodes,
  );
  assert.deepEqual(none, []);

  const added = addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  assert.deepEqual(activeFxPairs(added.mainCode, added.subCodes), [
    { base: 'USD', quote: 'INR', key: 'USD/INR' },
  ]);
  const cleared = removeSubCurrency(added, 'USD');
  assert.deepEqual(activeFxPairs(cleared.mainCode, cleared.subCodes), []);
  assert.equal(fxPairKey('USD', 'INR'), 'USD/INR');
});

test('TM-FX-015: select/change Sub or Main changes only distinct configured pairs', () => {
  const one = addSubCurrency(DEFAULT_CURRENCY_PREFERENCES, 'USD');
  const two = addSubCurrency(one, 'EUR');
  const changed = withMainCurrency(two, 'USD');
  assert.deepEqual(activeFxPairs(changed.mainCode, changed.subCodes), [
    { base: 'EUR', quote: 'USD', key: 'EUR/USD' },
  ]);
  assert.deepEqual(activeFxPairs('INR', ['INR', 'USD', 'USD']), [
    { base: 'USD', quote: 'INR', key: 'USD/INR' },
  ]);
  const display = withCurrencyDisplay(two, { decimalDigits: 3 });
  const subDisplay = withSubCurrencyDisplay(two, 'EUR', { decimalDigits: 1 });
  assert.deepEqual(activeFxPairs(display.mainCode, display.subCodes), [
    { base: 'USD', quote: 'INR', key: 'USD/INR' },
    { base: 'EUR', quote: 'INR', key: 'EUR/INR' },
  ]);
  assert.deepEqual(
    activeFxPairs(subDisplay.mainCode, subDisplay.subCodes),
    activeFxPairs(two.mainCode, two.subCodes),
  );
});

test('TM-FX-016: only correctly signed pair metadata can hydrate local cache', () => {
  const now = Date.UTC(2026, 10, 21, 0, 0, 0);
  const good = {
    version: 1,
    source: 'frankfurter',
    fetchedAt: now,
    quote: { base: 'USD', quote: 'INR', rate: 82.5, date: '2026-11-20' },
  };
  assert.deepEqual(parseCachedReferenceRate('USD', 'INR', good, now), {
    quote: good.quote,
    fetchedAt: now,
  });
  assert.equal(parseCachedReferenceRate('EUR', 'INR', good, now), null);
  assert.equal(parseCachedReferenceRate('USD', 'USD', good, now), null);
  assert.equal(parseCachedReferenceRate('USD', 'INR', { ...good, source: 'other' }, now), null);
  assert.equal(parseCachedReferenceRate('USD', 'INR', { ...good, version: 2 }, now), null);
  assert.equal(parseCachedReferenceRate('USD', 'INR', { ...good, fetchedAt: 0 }, now), null);
  assert.equal(
    parseCachedReferenceRate('USD', 'INR', { ...good, fetchedAt: now + 900000 }, now),
    null,
  );
  assert.equal(
    parseCachedReferenceRate('USD', 'INR', { ...good, quote: { ...good.quote, rate: -1 } }, now),
    null,
  );
});

test('TM-FX-017: shared startup controller, screen-only display and manual force path', () => {
  const root = readFileSync('src/app/_layout.tsx', 'utf8');
  const controller = readFileSync('src/shared/currency/fx-rate-provider.tsx', 'utf8');
  const screenVm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const cache = readFileSync('src/data/market/fx-reference-rate-cache.ts', 'utf8');
  assert.match(root, /<FxRateProvider>/);
  assert.ok(root.indexOf('<DatabaseGate>') < root.indexOf('<FxRateProvider>'));
  assert.match(controller, /activeFxPairs\(preferences.mainCode, preferences.subCodes\)/);
  assert.match(controller, /for \(const pair of pairs\)/);
  assert.match(controller, /void refreshRate\(pair.base, pair.quote\).catch/);
  assert.match(controller, /const activeRequest = pending.current\[key\]/);
  assert.match(controller, /status: last.rate \? 'cached' : 'unavailable'/);
  assert.match(controller, /cache.write\(result, fetchedAt\)/);
  assert.match(cache, /Storage.getItemSync/);
  assert.match(cache, /Storage.setItemSync/);
  assert.doesNotMatch(screenVm, /getReferenceRate\(|useEffect\(|setRates\(/);
  assert.match(screenVm, /useFxRates\(\)/);
  assert.match(screenVm, /void refreshRate\(detailCode, main\)/);
});
