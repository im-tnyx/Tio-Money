import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  FLOATING_ADD_SIZE,
  NAV_BORDER_WIDTH,
  NAV_ITEM_HEIGHT,
  getFloatingAddPosition,
} from '../../src/shared/navigation/fab-layout';
import {
  ADD_TRANSACTION_ROUTE,
  ROOT_DESTINATIONS,
} from '../../src/shared/navigation/root-destinations';

test('five owner-approved destinations use English-only labels', () => {
  assert.deepEqual(
    ROOT_DESTINATIONS.map((destination) => destination.label),
    ['Home', 'Trans.', 'Stats.', 'Account', 'More'],
  );
  assert.equal(ROOT_DESTINATIONS.length, 5);
  assert.equal(new Set(ROOT_DESTINATIONS.map((item) => item.href)).size, 5);
  assert.ok(ROOT_DESTINATIONS.every((item) => item.accessibleName.length > 0));
});

test('the Add FAB is an action, not a content tab', () => {
  assert.equal(ADD_TRANSACTION_ROUTE, '/transaction/new');
  const contentRoutes: readonly string[] = ROOT_DESTINATIONS.map((item) => item.href);
  assert.equal(contentRoutes.includes(ADD_TRANSACTION_ROUTE), false);
  const layout = readFileSync('src/app/(tabs)/_layout.tsx', 'utf8');
  const shell = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');
  const floating = readFileSync('src/shared/ui/floating-add-button.tsx', 'utf8');
  assert.match(layout, /<RootTabBar \/>/);
  assert.match(layout, /<FloatingAddButton \/>/);
  assert.ok(layout.indexOf('<RootTabBar />') < layout.indexOf('<FloatingAddButton />'));
  assert.doesNotMatch(shell, /accessibilityLabel="Add transaction"/);
  assert.match(floating, /accessibilityLabel="Add transaction"/);
  assert.match(floating, /position: 'absolute'/);
  assert.match(floating, /router\.push\(ADD_TRANSACTION_ROUTE\)/);
});

test('unified editor preview still disables both save actions', () => {
  const editor = readFileSync('src/features/transactions/transaction-editor-screen.tsx', 'utf8');
  assert.match(editor, /<SegmentedTabs/);
  assert.match(editor, /<ActionButton label="Save" disabled \/>/);
  assert.match(editor, /label="Save & Add Another" variant="secondary" disabled/);
});

test('all five navigation destinations have route shells', () => {
  const paths = [
    'src/app/(tabs)/index.tsx',
    'src/app/(tabs)/transactions.tsx',
    'src/app/(tabs)/reports.tsx',
    'src/app/(tabs)/accounts.tsx',
    'src/app/(tabs)/more.tsx',
  ];
  for (const path of paths) assert.ok(readFileSync(path, 'utf8').length > 0);
});

test('floating Add is centered over More and above the bar, including safe areas', () => {
  for (const device of [
    { windowWidth: 320, leftInset: 0, rightInset: 0, bottomInset: 0 },
    { windowWidth: 390, leftInset: 0, rightInset: 0, bottomInset: 34 },
    { windowWidth: 844, leftInset: 44, rightInset: 44, bottomInset: 21 },
  ]) {
    const horizontalPadding = 8;
    const topPadding = 8;
    const floatingGap = 12;
    const position = getFloatingAddPosition({
      ...device,
      horizontalPadding,
      topPadding,
      floatingGap,
    });
    const leftPadding = Math.max(horizontalPadding, device.leftInset);
    const rightPadding = Math.max(horizontalPadding, device.rightInset);
    const moreTabWidth =
      (device.windowWidth - leftPadding - rightPadding) / ROOT_DESTINATIONS.length;
    const moreCenterFromRight = rightPadding + moreTabWidth / 2;
    assert.ok(Math.abs(position.right + FLOATING_ADD_SIZE / 2 - moreCenterFromRight) < 1);
    const navHeight =
      NAV_BORDER_WIDTH + topPadding + NAV_ITEM_HEIGHT + Math.max(device.bottomInset, 8);
    assert.equal(position.bottom - navHeight, floatingGap);
    assert.ok(position.right >= 8);
  }
});
