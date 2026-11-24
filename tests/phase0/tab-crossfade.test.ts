import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { getNavigationMotion } from '../../src/shared/navigation/navigation-motion';
import { motion } from '../../src/shared/theme/primitives';
import { navigationTokens } from '../../src/shared/theme/component-tokens';

const layout = readFileSync('src/app/(tabs)/_layout.tsx', 'utf8');
const root = readFileSync('src/app/_layout.tsx', 'utf8');
const groupRoute = readFileSync('src/features/settings/account-groups-route.tsx', 'utf8');
const provider = readFileSync('src/shared/navigation/reduced-motion-provider.tsx', 'utf8');
const hook = readFileSync('src/shared/navigation/use-navigation-motion.ts', 'utf8');
const alias = readFileSync('src/shared/navigation/use-reduced-tab-motion.ts', 'utf8');
const bar = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');

test('one theme primitive owns both tab and detail fade intent', () => {
  assert.equal(motion.tabCrossfadeDurationMs, 160);
  assert.equal(navigationTokens.tabCrossfadeDurationMs, motion.tabCrossfadeDurationMs);
  assert.equal(navigationTokens.detailFadeDurationMs, motion.tabCrossfadeDurationMs);
  const active = getNavigationMotion(false, navigationTokens, 'ios');
  assert.deepEqual(active.tab, {
    animation: 'fade',
    transitionSpec: { animation: 'timing', config: { duration: 160 } },
  });
  assert.deepEqual(active.detail, { animation: 'fade', animationDuration: 160 });

  const android = getNavigationMotion(false, navigationTokens, 'android');
  assert.deepEqual(android.tab, active.tab);
  assert.deepEqual(android.detail, { animation: 'fade' });

  const reduced = getNavigationMotion(true, navigationTokens, 'ios');
  assert.equal(reduced.tab.animation, 'none');
  assert.equal(reduced.detail.animation, 'none');
  assert.equal(reduced.detail.animationDuration, navigationTokens.detailFadeDurationMs);

  const androidReduced = getNavigationMotion(true, navigationTokens, 'android');
  assert.deepEqual(androidReduced.tab, reduced.tab);
  assert.deepEqual(androidReduced.detail, { animation: 'none' });

  const source = readFileSync('src/shared/navigation/navigation-motion.ts', 'utf8');
  assert.doesNotMatch(source, /slide_from_right|fade_from_bottom|animationDuration: \d+/);
  assert.match(source, /platform === 'ios'/);
});

test('five-tab scene host reuses policy without animating the tab bar or FAB', () => {
  assert.match(layout, /import \{ Tabs \} from 'expo-router'/);
  assert.match(layout, /useNavigationMotion\(\)/);
  assert.match(layout, /\.\.\.motion\.tab/);
  assert.match(layout, /tabBar=\{\(\) => null\}/);
  assert.match(layout, /sceneStyle: \{ backgroundColor: theme\.colors\.canvas \}/);
  assert.match(layout, /backBehavior="history"/);
  assert.doesNotMatch(layout, /<Slot|animation: 'shift'|Animated\.View/);
  assert.match(layout, /<RootTabBar \/>/);
  assert.match(layout, /<FloatingAddButton \/>/);
  assert.ok(layout.indexOf('</Tabs>') < layout.indexOf('<RootTabBar />'));
  assert.ok(layout.indexOf('<RootTabBar />') < layout.indexOf('<FloatingAddButton />'));
  assert.doesNotMatch(bar, /animation:|Animated\.|withTiming|setTimeout/);
});

test('Account Groups detail reuses fade with native gesture ownership', () => {
  assert.match(root, /useNavigationMotion\(\)/);
  assert.match(root, /<Stack\.Screen name="account-groups" options=\{motion\.detail\} \/>/);
  assert.match(
    groupRoute,
    /<Stack\.Screen options=\{\{ gestureEnabled: !swipe\.cardTouchActive \}\} \/>/,
  );
  assert.doesNotMatch(groupRoute, /animation: ['"]fade['"]|animationDuration: \d+/);
  const screen = readFileSync('src/features/settings/account-groups-screen.tsx', 'utf8');
  assert.doesNotMatch(screen, /Animated\.View|useNavigationMotion|animationDuration|useRouter/);
  const sheet = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  assert.match(sheet, /animate = true/);
});

test('native Stack uses theme canvas as opaque underlay for push and reverse Back', () => {
  assert.match(root, /function AppNavigationStack\(\) \{\s+const theme = useAppTheme\(\)/);
  assert.match(root, /contentStyle: \{ backgroundColor: theme\.colors\.canvas \}/);
  assert.match(layout, /sceneStyle: \{ backgroundColor: theme\.colors\.canvas \}/);
  assert.doesNotMatch(root, /backgroundColor: ['"](?:white|#fff(?:fff)?)['"]/i);
  assert.match(root, /<Stack\.Screen name="\(tabs\)" \/>/);
  assert.doesNotMatch(root, /Animated\.View|cardStyleInterpolator/);
});

test('Settings and Accounts detail routes preregister the same native Stack motion', () => {
  assert.match(root, /<Stack\.Screen name="account-groups" options=\{motion\.detail\} \/>/);
  assert.match(root, /<Stack\.Screen name="currency\/main" options=\{motion\.detail\} \/>/);
  assert.match(root, /<Stack\.Screen name="currency\/sub" options=\{motion\.detail\} \/>/);
  assert.match(root, /<Stack\.Screen name="currency\/sub-detail" options=\{motion\.detail\} \/>/);
  assert.match(root, /<Stack\.Screen name="manage-accounts" options=\{motion\.detail\} \/>/);
  assert.doesNotMatch(root, /<Stack\.Screen name="add-account/);
  assert.equal(root.match(/options=\{motion\.detail\}/g)?.length, 5);
  assert.doesNotMatch(root, /animation: ['"](?:fade|slide_from_right)['"]|animationDuration: \d+/);

  const subRoute = readFileSync('src/features/settings/sub-currency-route.tsx', 'utf8');
  assert.match(
    subRoute,
    /<Stack\.Screen options=\{\{ gestureEnabled: !swipe\.cardTouchActive \}\} \/>/,
  );
  const detailRoutes = [
    'src/features/settings/main-currency-route.tsx',
    'src/features/settings/sub-currency-route.tsx',
    'src/features/settings/sub-currency-detail-route.tsx',
  ];
  for (const path of detailRoutes) {
    const route = readFileSync(path, 'utf8');
    assert.doesNotMatch(route, /useNavigationMotion|animationDuration|slide_from_right/);
  }
});

test('Currency details preserve native forward push and Back pop', () => {
  const moreViewModel = readFileSync('src/features/settings/use-more-view-model.ts', 'utf8');
  const mainViewModel = readFileSync(
    'src/features/settings/use-main-currency-view-model.ts',
    'utf8',
  );
  const subViewModel = readFileSync('src/features/settings/use-sub-currency-view-model.ts', 'utf8');
  assert.match(moreViewModel, /router\.push\('\/currency\/main'\)/);
  assert.match(moreViewModel, /router\.push\('\/currency\/sub'\)/);
  assert.match(mainViewModel, /case 'back':\s*router\.back\(\)/);
  assert.match(subViewModel, /case 'back':\s*router\.back\(\)/);
  assert.match(subViewModel, /router\.push\(\{ pathname: '\/currency\/sub-detail'/);
  assert.match(subViewModel, /case 'detail\.dismiss':\s*dismissDetail\(\);\s*router\.back\(\)/);
  assert.doesNotMatch(moreViewModel, /router\.replace\('\/currency\//);
  assert.doesNotMatch(subViewModel, /router\.replace\(/);
});

test('five original tab routes and splash ownership are unchanged', () => {
  const names = [...layout.matchAll(/<Tabs\.Screen name="([^"]+)" \/>/g)].map((match) => match[1]);
  assert.deepEqual(names, ['index', 'transactions', 'reports', 'accounts', 'more']);
  assert.match(layout, /useRevealTabsOnLayout\(\)/);
  assert.match(layout, /onLayout=\{revealTabsOnLayout\}/);
  assert.match(bar, /selected=\{active\}/);
  assert.match(bar, /accessibilityState=\{\{ selected: active \}\}/);
  assert.match(root, /<ReducedMotionProvider>/);
  assert.match(root, /<Stack\.Screen name="\(tabs\)" \/>/);
});

test('one root-owned Reduced Motion listener serves both navigator types', () => {
  assert.match(provider, /useState\(true\)/);
  assert.match(provider, /AccessibilityInfo\.isReduceMotionEnabled\(\)/);
  assert.match(provider, /AccessibilityInfo\.addEventListener\('reduceMotionChanged'/);
  assert.match(provider, /observedChange = true/);
  assert.match(provider, /mounted && !observedChange/);
  assert.match(provider, /subscription\.remove\(\)/);
  assert.match(provider, /mounted = false/);
  assert.match(provider, /useContext\(ReducedMotionContext\)/);
  assert.match(hook, /getNavigationMotion\(reduceMotion, theme\.navigation, Platform\.OS\)/);
  assert.match(hook, /import \{ Platform \} from 'react-native'/);
  assert.match(hook, /useReducedMotion\(\)/);
  assert.match(alias, /useReducedMotion as useReducedTabMotion/);
  assert.doesNotMatch(provider, /useRouter|Sqlite|SQLite|setInterval/);
});

test('Account Groups opens with native push and closes with native pop, not replace', () => {
  const moreViewModel = readFileSync('src/features/settings/use-more-view-model.ts', 'utf8');
  const groupViewModel = readFileSync(
    'src/features/settings/use-account-groups-view-model.ts',
    'utf8',
  );
  assert.match(moreViewModel, /router\.push\('\/account-groups'\)/);
  assert.match(groupRoute, /useAccountGroupsViewModel\(\(\) => router\.back\(\)\)/);
  assert.match(groupViewModel, /case 'back':\s*onBack\(\)/);
  assert.doesNotMatch(groupRoute, /router\.replace\(/);
  assert.doesNotMatch(moreViewModel, /router\.replace\('\/account-groups'\)/);
});
