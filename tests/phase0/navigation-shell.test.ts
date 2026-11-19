import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

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
  assert.ok(ROOT_DESTINATIONS.every((item) => item.href !== ADD_TRANSACTION_ROUTE));
  const shell = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');
  assert.match(shell, /accessibilityLabel="Add transaction"/);
  assert.match(shell, /position: 'absolute'/);
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
