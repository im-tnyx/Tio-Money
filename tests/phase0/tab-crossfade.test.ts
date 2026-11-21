import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { motion } from '../../src/shared/theme/primitives';
import { navigationTokens } from '../../src/shared/theme/component-tokens';

const layout = readFileSync('src/app/(tabs)/_layout.tsx', 'utf8');
const hook = readFileSync('src/shared/navigation/use-reduced-tab-motion.ts', 'utf8');
const bar = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');

test('tab scenes use a 160ms native crossfade, with no animation on the shared bar/FAB', () => {
  assert.equal(motion.tabCrossfadeDurationMs, 160);
  assert.equal(navigationTokens.tabCrossfadeDurationMs, motion.tabCrossfadeDurationMs);
  assert.match(layout, /import \{ Tabs \} from 'expo-router'/);
  assert.match(layout, /animation: reduceMotion \? 'none' : 'fade'/);
  assert.match(layout, /animation: 'timing'/);
  assert.match(layout, /duration: theme\.navigation\.tabCrossfadeDurationMs/);
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

test('tab scene host registers exactly five original routes without new screens', () => {
  const names = [...layout.matchAll(/<Tabs\.Screen name="([^\"]+)" \/>/g)].map((match) => match[1]);
  assert.deepEqual(names, ['index', 'transactions', 'reports', 'accounts', 'more']);
  assert.match(layout, /useRevealTabsOnLayout\(\)/);
  assert.match(layout, /onLayout=\{revealTabsOnLayout\}/);
  assert.match(bar, /selected=\{active\}/);
  assert.match(bar, /accessibilityState=\{\{ selected: active \}\}/);
});

test('reduced motion honors initial unknown state, changes and unmount cleanup', () => {
  assert.match(hook, /useState\(true\)/);
  assert.match(hook, /AccessibilityInfo\.isReduceMotionEnabled\(\)/);
  assert.match(hook, /AccessibilityInfo\.addEventListener\('reduceMotionChanged'/);
  assert.match(hook, /observedChange = true/);
  assert.match(hook, /mounted && !observedChange/);
  assert.match(hook, /subscription\.remove\(\)/);
  assert.match(hook, /mounted = false/);
  assert.doesNotMatch(hook, /useRouter|Sqlite|SQLite|setInterval/);
});
