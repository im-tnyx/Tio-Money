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

test('TM-CUR-031: no extra labels above or below the Sub Currency card', () => {
  const screen = readFileSync('src/features/settings/sub-currency-screen.tsx', 'utf8');
  const sheet = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  assert.doesNotMatch(screen, /t\('currencyMain'\)|t\('currencySubCount'\)/);
  assert.doesNotMatch(screen, /t\('currencyFxDisclosure'\)/);
  assert.match(screen, /state.selected.map/);
  assert.match(screen, /formatReferenceRate\(item.rate\)/);
  assert.doesNotMatch(screen, /currencyFxSource|item\.rate\.date/);
  assert.match(screen, /state.error/);
  assert.match(sheet, /currencySubCount/);
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
  assert.match(screen, /onResponderTerminate=\{\(\) => setDragOffset\(null\)\}/);
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
