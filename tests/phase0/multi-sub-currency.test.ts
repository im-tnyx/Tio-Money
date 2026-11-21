import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  DEFAULT_CURRENCY_PREFERENCES,
  MAX_SUB_CURRENCIES,
  addSubCurrency,
  removeSubCurrency,
  withMainCurrency,
  withSubCurrency,
  type CurrencyCode,
} from '../../src/shared/currency/currency-preference';
import { formatReferenceRate, parseReferenceRate } from '../../src/data/market/fx-reference-rates';
import {
  formatSubCurrencyLastChecked,
  shouldOfferSubCurrencyRefresh,
  wasReferenceRateCheckedToday,
} from '../../src/features/settings/sub-currency-rate-freshness';
import {
  getSwipeOffset,
  isHorizontalSwipe,
  snapSwipeOffset,
  shouldCloseRevealedSwipe,
} from '../../src/features/settings/sub-currency-swipe';

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
  assert.doesNotMatch(screen, /currencyFxSource|item\.rate\.date/);
  assert.match(screen, /currencyFxUnavailable/);
  assert.doesNotMatch(sheet, /rate\.date|formatReferenceRate|currencyFxSource/);
  assert.doesNotMatch(fx, /accountId|transactionId|ledger|balance/);
});

test('TM-CUR-031: show selected Main above Sub cards, without picker count clutter', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  assert.match(screen, /\{t\('currencyMain'\)\}/);
  assert.match(screen, /\{state.mainLabel\}/);
  assert.ok(screen.indexOf("{t('currencyMain')}") < screen.indexOf('state.selected.map'));
  assert.match(screen, /disabled=\{!state.canAddSub\}/);
  assert.match(screen, /accessibilityState=\{\{ disabled \}\}/);
  assert.match(vm, /canAddSub: mainConfigured/);
  assert.doesNotMatch(screen, /t\('currencySubCount'\)|t\('currencyFxDisclosure'\)/);
  assert.match(screen, /state.selected.map/);
  assert.match(screen, /formatReferenceRate\(item.rate\)/);
  assert.doesNotMatch(screen, /currencyFxSource|item\.rate\.date/);
  assert.match(screen, /state.error/);
  assert.doesNotMatch(sheet, /currencySubCount/);
  assert.match(sheet, /currencySubLimitReached/);
});

test('TM-CUR-032: no Pencil/X/minus edit mode; swipe is the visible delete action', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const contract = readFileSync('src/features/settings/sub-currency-contract.ts', 'utf8');
  const row = screen.slice(screen.indexOf('state.selected.map('));
  assert.match(screen, /accessibilityLabel=\{t\('currencyPageBack'\)\}/);
  assert.match(screen, /label=\{t\('currencyAddSub'\)\}/);
  assert.doesNotMatch(screen, /pencil|currencyCancelEdit|currencyEditSub|state\.editing|<Circle/);
  assert.doesNotMatch(vm + contract, /setEditing|edit\.cancel|edit\.toggle|readonly editing/);
  assert.match(row, /minHeight: theme\.buttons\.minimumHeight \+ theme\.space\.xxl/);
  assert.match(row, /accessibilityActions=/);
  assert.match(row, /onAccessibilityAction=/);
  assert.match(row, /actionName === 'delete'/);
  assert.doesNotMatch(row, /d="M7 12h10"|disabled=\{state\.editing\}/);
});

test('TM-CUR-033: left swipe reveals per-currency Delete without Pencil', () => {
  assert.equal(isHorizontalSwipe(-40, 5, 8), true);
  assert.equal(isHorizontalSwipe(40, 5, 8), true);
  assert.equal(isHorizontalSwipe(5, 40, 8), false);
  assert.equal(isHorizontalSwipe(-4, 0, 8), false);
  assert.equal(getSwipeOffset(0, -100, 88), 88);
  assert.equal(getSwipeOffset(0, -30, 88), 30);
  assert.equal(getSwipeOffset(88, 120, 88), 0);
  assert.equal(snapSwipeOffset(30, 88), 0);
  assert.equal(snapSwipeOffset(60, 88), 88);
  // A short right swipe should dismiss the opened row, even though the
  // midpoint-only snap previously left its Delete action visible.
  assert.equal(snapSwipeOffset(getSwipeOffset(88, 20, 88), 88), 88);
  assert.equal(shouldCloseRevealedSwipe(88, 20, 1, 8), true);
  assert.equal(shouldCloseRevealedSwipe(88, 120, 0, 8), true);
  assert.equal(shouldCloseRevealedSwipe(88, -40, 1, 8), false);
  assert.equal(shouldCloseRevealedSwipe(88, 4, 1, 8), false);
  assert.equal(shouldCloseRevealedSwipe(88, 12, 50, 8), false);
  assert.equal(shouldCloseRevealedSwipe(0, 40, 0, 8), false);
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  assert.match(screen, /function SwipeableCurrencyRow/);
  assert.match(screen, /onMoveShouldSetResponderCapture/);
  assert.match(screen, /onMoveShouldSetResponder=/);
  assert.match(screen, /isHorizontalSwipe/);
  assert.match(screen, /shouldCloseRevealedSwipe/);
  assert.match(screen, /onResponderRelease/);
  assert.match(screen, /snapSwipeOffset/);
  assert.match(screen, /shouldCloseRevealedSwipe[\s\S]*?\{\s*onClose\(\);/);
  assert.doesNotMatch(screen, /!editing &&/);
  assert.match(screen, /backgroundColor: theme.colors.deleteActionBackground/);
  assert.match(screen, /color: theme.colors.deleteActionText/);
  assert.match(screen, /translateX: -displayedOffset/);
  assert.ok(screen.includes('onDelete={() => {'));
  assert.ok(screen.includes("onAction({ type: 'remove', code: item.code });"));
  assert.match(screen, /key=\{item.code\}/);
  assert.doesNotMatch(screen, /item.rate.date|currencyFxSource/);
  assert.match(screen, /formatReferenceRate\(item.rate\)/);
});

test('TM-CUR-044: iOS Back is suppressed only during touches that start on a Sub card', () => {
  const route = readFileSync('src/features/settings/sub-currency-route.tsx', 'utf8');
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const root = readFileSync('src/app/_layout.tsx', 'utf8');
  const main = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  assert.match(route, /<Stack.Screen options=\{\{ gestureEnabled: !cardTouchActive \}\} \/>/);
  assert.match(route, /const \[cardTouchActive, setCardTouchActive\] = useState\(false\)/);
  assert.match(route, /onCardTouchStart=\{onCardTouchStart\}/);
  assert.match(route, /onCardTouchEnd=\{onCardTouchEnd\}/);
  assert.match(screen, /onTouchStart=\{\(event\) => \{\s*onCardTouchStart\(\)/);
  assert.match(screen, /onTouchEnd=\{onCardTouchEnd\}/);
  assert.match(screen, /onTouchCancel=\{onCardTouchEnd\}/);
  assert.match(screen, /onResponderTerminate=\{\(\) => \{[\s\S]*?onCardTouchEnd\(\);/);
  assert.match(screen, /onResponderRelease=\{\(event\) => \{[\s\S]*?onCardTouchEnd\(\);/);
  assert.match(screen, /shouldCloseRevealedSwipe/);
  assert.doesNotMatch(route, /gestureEnabled: openSwipeCode === null/);
  assert.doesNotMatch(screen + root + main, /gestureEnabled:\s*false/);
  // Screen outside cards never calls onCardTouchStart, preserving system Back.
  const outer = screen.slice(screen.indexOf('<ScrollView'), screen.indexOf('state.selected.map'));
  assert.doesNotMatch(outer, /onCardTouchStart/);
});

test('TM-CUR-037: one swipe Delete action closes when tapping outside, without deletion', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  assert.match(
    screen,
    /const \[openSwipeCode, setOpenSwipeCode\] = useState<string \| null>\(null\)/,
  );
  assert.match(screen, /isOpen=\{openSwipeCode === item.code\}/);
  assert.match(screen, /onReveal=\{\(\) => setOpenSwipeCode\(item.code\)\}/);
  assert.match(screen, /onClose=\{\(\) => setOpenSwipeCode\(null\)\}/);
  assert.match(screen, /accessibilityLabel=\{t\('currencyHideDelete'\)\}/);
  assert.match(screen, /onPress=\{\(\) => setOpenSwipeCode\(null\)\}/);
  assert.match(screen, /\{t\('currencyDelete'\)\}/);
  assert.match(screen, /dragOffset \?\? \(isOpen \? revealWidth : 0\)/);
  assert.match(screen, /onResponderTerminate=\{\(\) => \{/);
  assert.match(screen, /setDragOffset\(null\);\s*onCardTouchEnd\(\);/);
  assert.doesNotMatch(screen, /setOffset\(/);
});

test('TM-CUR-038: both currency headers use shared fixed 50dp token', () => {
  const sub = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const main = readFileSync('src/features/settings/main-currency-screen.tsx', 'utf8');
  const theme = readFileSync('src/shared/theme/component-tokens.ts', 'utf8');
  assert.match(theme, /topBarHeight: size\.dp50/);
  for (const source of [sub, main]) {
    assert.match(source, /height: theme\.navigation\.topBarHeight/);
    assert.doesNotMatch(source, /minHeight: theme\.navigation\.topBarHeight/);
  }
  assert.match(sub, /minHeight: theme\.buttons\.minimumHeight \+ theme\.space\.xxl/);
  assert.match(sub, /minHeight: theme\.buttons\.minimumHeight/);
});

test('TM-CUR-045: Sub creation requires a valid Main while default INR remains valid', () => {
  const invalid = {
    ...DEFAULT_CURRENCY_PREFERENCES,
    mainCode: null as unknown as CurrencyCode,
  };
  assert.equal(DEFAULT_CURRENCY_PREFERENCES.mainCode, 'INR');
  assert.throws(() => addSubCurrency(invalid, 'USD'), /valid Main Currency/);
  assert.throws(() => withSubCurrency(invalid, 'USD'), /valid Main Currency/);
  assert.deepEqual(withSubCurrency(invalid, null).subCodes, []);
  const controller = readFileSync('src/shared/currency/currency-provider.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  assert.match(controller, /if \(!isCurrencyCode\(current.current.mainCode\)\)/);
  assert.match(controller, /currencyChooseMainFirst/);
  assert.match(vm, /if \(!isCurrencyCode\(preferences.mainCode\)\) break/);
});

test('TM-CUR-048: Main row and Sub list touch without an inter-card gap', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const scrollArea = screen.slice(
    screen.indexOf('<ScrollView'),
    screen.indexOf('{state.error ? ('),
  );
  assert.match(scrollArea, /gap: theme\.space\.md/);
  assert.match(
    scrollArea,
    /<View>\s*<View[\s\S]*?\{t\('currencyMain'\)\}[\s\S]*?\{state\.selected\.length > 0 \? \(/,
  );
  const listCard = scrollArea.slice(scrollArea.indexOf('{state.selected.length > 0 ? ('));
  assert.match(listCard, /backgroundColor: theme\.colors\.card/);
  assert.doesNotMatch(listCard, /borderTopWidth: theme\.navigation\.borderWidth/);
  assert.match(listCard, /borderBottomWidth: theme\.navigation\.borderWidth/);
});

test('TM-CUR-050: use local verification day, not the Frankfurter publication date', () => {
  const today = new Date(2026, 10, 22, 12, 30).getTime();
  const checkedToday = new Date(2026, 10, 22, 9, 30).getTime();
  const checkedYesterday = new Date(2026, 10, 21, 18, 30).getTime();
  const publishedFriday = '2026-11-20';
  assert.equal(publishedFriday, '2026-11-20'); // Weekend publication may lag.
  assert.equal(wasReferenceRateCheckedToday(checkedToday, today), true);
  assert.equal(wasReferenceRateCheckedToday(checkedYesterday, today), false);
  assert.equal(wasReferenceRateCheckedToday(null, today), false);
  assert.equal(wasReferenceRateCheckedToday(today + 60_000, today), false);
  assert.equal(shouldOfferSubCurrencyRefresh('available', checkedToday, today), false);
  assert.equal(shouldOfferSubCurrencyRefresh('available', checkedYesterday, today), true);
  assert.equal(shouldOfferSubCurrencyRefresh('cached', checkedToday, today), true);
  assert.equal(shouldOfferSubCurrencyRefresh('cached', checkedYesterday, today), true);
  assert.equal(shouldOfferSubCurrencyRefresh('unavailable', null, today), true);
  assert.equal(shouldOfferSubCurrencyRefresh('loading', null, today), false);
  assert.equal(formatSubCurrencyLastChecked(checkedYesterday, today), '21 Nov');
  assert.equal(formatSubCurrencyLastChecked(null, today), null);
  assert.equal(formatSubCurrencyLastChecked(new Date(2025, 10, 22).getTime(), today), '22 Nov 2025');
});

test('TM-CUR-051: stale FX retry is a right-aligned action within the same-height Sub card', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const vm = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  const provider = readFileSync('src/shared/currency/fx-rate-provider.tsx', 'utf8');
  const contract = readFileSync('src/features/settings/sub-currency-contract.ts', 'utf8');
  const card = screen.slice(screen.indexOf('state.selected.map('));
  assert.match(card, /minHeight: theme.buttons.minimumHeight \+ theme.space.xxl/);
  assert.match(card, /\{item.showRefresh \? \(/);
  assert.match(card, /width: theme.space.xxxl \* 3/);
  assert.match(card, /minHeight: theme.buttons.minimumHeight/);
  assert.match(card, /\{item.lastCheckedLabel\}/);
  assert.match(card, /'currencyFxRefreshNow'/);
  assert.match(card, /type: 'card.refresh', code: item.code/);
  assert.match(card, /accessibilityRole="button"/);
  assert.match(contract, /readonly showRefresh: boolean/);
  assert.match(vm, /shouldOfferSubCurrencyRefresh\(rateStatus, checkedAt, freshnessNow\)/);
  assert.match(vm, /formatSubCurrencyLastChecked\(checkedAt, freshnessNow\)/);
  assert.match(vm, /case 'card.refresh'/);
  assert.match(vm, /if \(!preferences.subCodes.includes\(action.code\)\) break/);
  assert.match(vm, /void refreshRate\(action.code, main\)/);
  assert.match(vm, /AppState.addEventListener\('change'/);
  assert.match(provider, /cache.write\(result, fetchedAt\)/);
  assert.doesNotMatch(screen, /getReferenceRate\(|setInterval\(/);
});
