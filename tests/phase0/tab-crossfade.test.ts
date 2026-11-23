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
  const active = getNavigationMotion(false, navigationTokens);
  assert.deepEqual(active.tab, {
    animation: 'fade',
    transitionSpec: { animation: 'timing', config: { duration: 160 } },
  });
  assert.deepEqual(active.detail, { animation: 'fade', animationDuration: 160 });

  const reduced = getNavigationMotion(true, navigationTokens);
  assert.equal(reduced.tab.animation, 'none');
  assert.equal(reduced.detail.animation, 'none');
  assert.equal(reduced.detail.animationDuration, navigationTokens.detailFadeDurationMs);
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
  assert.match(sheet, /animationType="slide"/);
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
  assert.match(hook, /getNavigationMotion\(reduceMotion, theme\.navigation\)/);
  assert.match(hook, /useReducedMotion\(\)/);
  assert.match(alias, /useReducedMotion as useReducedTabMotion/);
  assert.doesNotMatch(provider, /useRouter|Sqlite|SQLite|setInterval/);
});
