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
  assert.deepEqual(
    ROOT_DESTINATIONS.map((item) => item.icon),
    ['home', 'transactions', 'statistics', 'accounts', 'more'],
  );
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
  const splashController = readFileSync(
    'src/shared/navigation/use-reveal-tabs-on-layout.ts',
    'utf8',
  );

  assert.match(bootstrap, /SplashScreen\.preventAutoHideAsync\(\)/);
  assert.match(bootstrap, /if \(state\.status === 'loading'\) return null/);
  assert.match(bootstrap, /if \(state\.status === 'ready'\) return/);
  assert.match(tabs, /useRevealTabsOnLayout\(\)/);
  assert.match(splashController, /SplashScreen\.hideAsync\(\)/);
  assert.doesNotMatch(tabs, /SplashScreen\.hideAsync\(\)/);
  assert.match(tabs, /onLayout=\{revealTabsOnLayout\}/);
  assert.doesNotMatch(bootstrap, /ActivityIndicator|Preparing your local workspace/);
  assert.match(root, /<Stack\.Screen name="\(tabs\)" \/>/);
  assert.doesNotMatch(root, /name="settings"|name="transaction\/new"|name="welcome"/);
});

test('all five tabs render official Google SVG paths with token sizing and theme color', () => {
  const tabBar = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');
  const icon = readFileSync('src/shared/ui/root-tab-icon.tsx', 'utf8');
  const destinations = readFileSync('src/shared/navigation/root-destinations.ts', 'utf8');
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
    dependencies: Record<string, string>;
  };
  const directory = 'src/shared/assets/google-material-icons';

  assert.match(tabBar, /<RootTabIcon/);
  assert.match(tabBar, /name=\{item\.icon\}/);
  assert.doesNotMatch(tabBar, /\{item\.glyph\}/);
  assert.doesNotMatch(destinations, /glyph:|⌂|▥|▤|•••/);
  assert.match(icon, /import \{ SvgXml \} from 'react-native-svg'/);
  assert.match(icon, /accessibilityElementsHidden/);
  assert.match(icon, /importantForAccessibility="no-hide-descendants"/);
  assert.match(icon, /MATERIAL_OUTLINED_SVG\[name\]\.replace/);
  assert.match(icon, /fill="\$\{color\}"/);
  assert.match(icon, /width=\{iconTokens\.size\} height=\{iconTokens\.size\}/);
  assert.doesNotMatch(icon, /require\(.+\.png|tabIconShapes|IconFont|<Image/);

  for (const name of ['home', 'transactions', 'statistics', 'accounts', 'more']) {
    const svg = readFileSync(directory + '/' + name + '.svg', 'utf8');
    assert.match(svg, /^<svg /);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.ok(icon.includes(name + ':'), name + ' should be mapped');
    assert.ok(icon.includes("'" + svg + "'"), name + ' uses the official SVG source');
    assert.equal(existsSync(directory + '/' + name + '.png'), false);
    assert.equal(existsSync(directory + '/' + name + '@2x.png'), false);
  }

  const license = readFileSync(directory + '/LICENSE.txt', 'utf8');
  const origin = readFileSync(directory + '/README.md', 'utf8');
  assert.match(license, /Apache License/);
  assert.match(origin, /google\/material-design-icons/);
  assert.equal(packageJson.dependencies['react-native-svg'], '15.16.0');
  assert.equal(packageJson.dependencies['@expo/vector-icons'], undefined);
  assert.equal(packageJson.dependencies['@react-native-vector-icons/material-icons'], undefined);
  assert.equal(packageJson.dependencies['react-native-svg-transformer'], undefined);
});

test('FAB plus is drawn from two centered lines rather than font metrics', () => {
  const floating = readFileSync('src/shared/ui/floating-add-button.tsx', 'utf8');
  assert.match(floating, /accessibilityLabel="Add transaction \(unavailable\)"/);
  assert.match(floating, /theme\.navigation\.fabMarkSize/);
  assert.match(floating, /theme\.navigation\.fabMarkOffset/);
  assert.match(floating, /theme\.navigation\.fabMarkStroke/);
  assert.match(floating, /theme\.navigation\.origin/);
  assert.doesNotMatch(floating, /<AppText|fontSize: 30/);
  assert.doesNotMatch(floating, /\bonPress\s*=|useRouter|router\.push/);
});
