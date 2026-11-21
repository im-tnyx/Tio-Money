import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  buttonTokens,
  iconRoleSizes,
  iconTokens,
  navigationTokens,
  shadowTokens,
} from '../../src/shared/theme/component-tokens';
import { opacity, size } from '../../src/shared/theme/primitives';
import {
  palettes,
  radius,
  space,
  typographyTokens,
  typeScale,
} from '../../src/shared/theme/tokens';

test('physical values have one owner and all reusable roles alias them', () => {
  assert.equal(space.xs, size.dp8);
  assert.equal(space.sm, size.dp12);
  assert.equal(space.xl, size.dp24);
  assert.equal(radius.sm, size.dp12);
  assert.equal(radius.xl, size.dp24);
  assert.equal(typeScale.body, size.dp16);
  assert.equal(typeScale.title, size.dp26);
  assert.equal(typographyTokens.navLabelSize, size.dp11);

  assert.equal(navigationTokens.itemHeight, size.dp48);
  assert.equal(navigationTokens.fabDiameter, size.dp50);
  assert.equal(
    navigationTokens.borderWidth +
      navigationTokens.topPadding +
      navigationTokens.itemHeight +
      navigationTokens.minimumBottomPadding,
    size.dp50,
  );
  assert.ok(navigationTokens.fabDiameter >= buttonTokens.minimumHeight);
  assert.equal(navigationTokens.fabGap, size.dp16);
  assert.equal(navigationTokens.iconLabelGap, size.dp1);
  assert.equal(navigationTokens.labelFontSize, typographyTokens.navLabelSize);
  assert.equal(navigationTokens.selectedIconWeight, 300);
  assert.equal(navigationTokens.unselectedIconWeight, 200);
  assert.equal(buttonTokens.minimumHeight, size.dp48);
  assert.equal(buttonTokens.disabledOpacity, opacity.disabled);
  assert.equal(shadowTokens.fab.opacity, opacity.fabShadow);
});

test('one shared icon size serves bottom nav and every future reusable component role', () => {
  assert.equal(iconTokens.size, size.dp24);
  assert.equal(iconTokens.stroke, size.dp2);
  assert.equal(iconTokens.fineStroke, size.dp1_5);
  assert.deepEqual(Object.keys(iconRoleSizes).sort(), [
    'bottomSheet',
    'button',
    'card',
    'navigation',
    'textField',
    'topBar',
  ]);
  assert.ok(Object.values(iconRoleSizes).every((token) => token === iconTokens.size));
  assert.equal(navigationTokens.fabMarkSize, iconTokens.size);
  assert.ok(navigationTokens.fabMarkSize < navigationTokens.fabDiameter);
});

test('one root theme provider resolves the selected preference and system colors', () => {
  const provider = readFileSync('src/shared/theme/theme-provider.tsx', 'utf8');
  assert.match(provider, /useColorScheme\(\)/);
  assert.match(provider, /resolveAppearanceScheme\(settings\.preference, systemScheme\)/);
  assert.match(provider, /palettes\[scheme\]/);
  assert.doesNotMatch(provider, /AsyncStorage|setColorScheme/);
  assert.notEqual(palettes.light.canvas, palettes.dark.canvas);
  assert.notEqual(palettes.light.primaryText, palettes.dark.primaryText);
  assert.equal(
    Object.keys(palettes.light).sort().join(','),
    Object.keys(palettes.dark).sort().join(','),
  );
});

function collectPresentationFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectPresentationFiles(path);
    return entry.isFile() && path.endsWith('.tsx') ? [path] : [];
  });
}

test('all current and future screen and shared UI surfaces own no raw visual sizes', () => {
  const uiFiles = [
    ...collectPresentationFiles('src/app'),
    ...collectPresentationFiles('src/shared/ui'),
    ...collectPresentationFiles('src/features'),
    'src/shared/bootstrap/database-gate.tsx',
  ];
  const fixedNumericStyle =
    /\b(?:fontSize|lineHeight|minHeight|minWidth|maxHeight|maxWidth|width|height|left|right|top|bottom|gap|padding|paddingTop|paddingBottom|paddingHorizontal|paddingVertical|borderWidth|borderTopWidth|borderRightWidth|borderBottomWidth|borderLeftWidth|border(?:TopLeft|TopRight|BottomLeft|BottomRight|TopStart|TopEnd|BottomStart|BottomEnd|StartStart|StartEnd|EndStart|EndEnd)?Radius|shadowOpacity|shadowRadius|elevation|zIndex)\s*:\s*-?\d+(?:\.\d+)?\b/g;
  for (const property of [
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'borderTopStartRadius',
    'borderTopEndRadius',
    'borderBottomStartRadius',
    'borderBottomEndRadius',
    'borderStartStartRadius',
    'borderStartEndRadius',
    'borderEndStartRadius',
    'borderEndEndRadius',
  ]) {
    assert.equal(
      `${property}: 2`.match(fixedNumericStyle)?.length,
      1,
      `${property} must be covered by the numeric style guard`,
    );
  }
  for (const file of uiFiles) {
    const source = readFileSync(file, 'utf8');
    assert.equal(
      source.match(fixedNumericStyle)?.length ?? 0,
      0,
      `${file} must consume central design tokens instead of numeric visual sizes`,
    );
  }
});

test('route screens are dumb blank UI and shell lifecycle/controller logic is external', () => {
  const routes = ['index', 'transactions', 'reports', 'accounts'];
  for (const route of routes) {
    const source = readFileSync(`src/app/(tabs)/${route}.tsx`, 'utf8');
    assert.match(source, /export default BlankScreen/);
    assert.doesNotMatch(source, /useState|useEffect|useRouter|usePathname|Sqlite|SQLite|fetch\(/);
  }

  const more = readFileSync('src/app/(tabs)/more.tsx', 'utf8');
  assert.match(more, /export \{ MoreRoute as default \}/);
  assert.doesNotMatch(more, /useState|useEffect|useRouter|usePathname|Sqlite|SQLite|fetch\(/);

  const moreScreen = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  assert.doesNotMatch(moreScreen, /useState|useEffect|useRouter|usePathname|Sqlite|SQLite|fetch\(/);
  const shell = readFileSync('src/app/(tabs)/_layout.tsx', 'utf8');
  const tabs = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');
  const fab = readFileSync('src/shared/ui/floating-add-button.tsx', 'utf8');
  const navHook = readFileSync('src/shared/navigation/use-root-tab-navigation.ts', 'utf8');
  const fabHook = readFileSync('src/shared/navigation/use-floating-add-position.ts', 'utf8');
  const splashHook = readFileSync('src/shared/navigation/use-reveal-tabs-on-layout.ts', 'utf8');

  assert.doesNotMatch(shell, /SplashScreen\.hideAsync|useCallback|usePathname|useRouter/);
  assert.doesNotMatch(tabs, /useRouter|usePathname|router\.navigate/);
  assert.doesNotMatch(fab, /useWindowDimensions|useSafeAreaInsets|useRouter|onPress=/);
  assert.match(navHook, /usePathname|useRouter/);
  assert.match(fabHook, /getFloatingAddPosition/);
  assert.match(splashHook, /SplashScreen\.hideAsync/);
});
