import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

import {
  FLOATING_ADD_SIZE,
  NAV_BORDER_WIDTH,
  NAV_ITEM_HEIGHT,
  getFloatingAddPosition,
} from '../../src/shared/navigation/fab-layout';
import { ROOT_DESTINATIONS } from '../../src/shared/navigation/root-destinations';

const screenRoutes = [
  'src/app/(tabs)/index.tsx',
  'src/app/(tabs)/transactions.tsx',
  'src/app/(tabs)/reports.tsx',
  'src/app/(tabs)/accounts.tsx',
  'src/app/(tabs)/more.tsx',
];

test('exactly five English bottom tabs remain', () => {
  assert.deepEqual(
    ROOT_DESTINATIONS.map((destination) => destination.label),
    ['Home', 'Trans.', 'Stats.', 'Account', 'More'],
  );
  assert.equal(ROOT_DESTINATIONS.length, 5);
  assert.equal(new Set(ROOT_DESTINATIONS.map((item) => item.href)).size, 5);
  assert.ok(ROOT_DESTINATIONS.every((item) => item.accessibleName.length > 0));
});

test('each tab is a blank themed screen with no top/header/finance preview', () => {
  for (const path of screenRoutes) {
    const source = readFileSync(path, 'utf8');
    assert.match(source, /import \{ BlankScreen \}/);
    assert.match(source, /export default BlankScreen/);
    assert.doesNotMatch(source, /ScreenHeader|StatePanel|TextField|SectionCard/);
  }
  const blank = readFileSync('src/shared/ui/blank-screen.tsx', 'utf8');
  assert.match(blank, /backgroundColor: theme.colors.canvas/);
  assert.doesNotMatch(blank, /<Text|<AppText|<ScreenHeader|<ScrollView/);

  const files = readdirSync('src/app/(tabs)').filter((name) => name.endsWith('.tsx'));
  assert.deepEqual(
    files.sort(),
    [...screenRoutes.map((path) => path.split('/').at(-1)), '_layout.tsx'].sort(),
  );
});

test('FAB is an accessible disabled icon, never a content tab or active action', () => {
  const layout = readFileSync('src/app/(tabs)/_layout.tsx', 'utf8');
  const tabBar = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');
  const floating = readFileSync('src/shared/ui/floating-add-button.tsx', 'utf8');

  assert.match(layout, /<RootTabBar \/>/);
  assert.match(layout, /<FloatingAddButton \/>/);
  assert.ok(layout.indexOf('<RootTabBar />') < layout.indexOf('<FloatingAddButton />'));
  assert.doesNotMatch(tabBar, /accessibilityLabel="Add transaction"/);
  assert.match(floating, /<Pressable\s+disabled/);
  assert.match(floating, /accessibilityState=\{\{ disabled: true \}\}/);
  assert.match(floating, /accessibilityRole="button"/);
  assert.doesNotMatch(floating, /\bonPress\s*=|useRouter|router\.push|router\.navigate/);
});

test('no Add, Settings, Welcome, legacy History or transaction editor route exists', () => {
  for (const path of [
    'src/app/transaction/new.tsx',
    'src/app/settings.tsx',
    'src/app/(setup)/welcome.tsx',
    'src/app/(tabs)/history.tsx',
    'src/features/transactions/transaction-editor-screen.tsx',
    'src/features/dashboard/home-screen.tsx',
    'src/features/common/planned-screen.tsx',
  ]) {
    assert.equal(existsSync(path), false, path);
  }

  const root = readFileSync('src/app/_layout.tsx', 'utf8');
  assert.match(root, /headerShown: false/);
  assert.doesNotMatch(root, /name="transaction\/new"|name="settings"|name="\(setup\)\/welcome"/);
});

test('floating disabled icon remains centered over More and above bar with safe areas', () => {
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

test('successful launch reveals only five blank tabs after the native splash', () => {
  const bootstrap = readFileSync('src/shared/bootstrap/database-gate.tsx', 'utf8');
  const root = readFileSync('src/app/_layout.tsx', 'utf8');
  const tabs = readFileSync('src/app/(tabs)/_layout.tsx', 'utf8');

  assert.match(bootstrap, /SplashScreen\.preventAutoHideAsync\(\)/);
  assert.match(bootstrap, /if \(state\.status === 'loading'\) return null/);
  assert.match(bootstrap, /if \(state\.status === 'ready'\) return/);
  assert.match(tabs, /SplashScreen\.hideAsync\(\)/);
  assert.match(tabs, /onLayout=\{revealTabsOnLayout\}/);
  assert.doesNotMatch(bootstrap, /ActivityIndicator|Preparing your local workspace/);
  assert.match(root, /<Stack\.Screen name="\(tabs\)" \/>/);
  assert.doesNotMatch(root, /name="settings"|name="transaction\/new"|name="welcome"/);
});
