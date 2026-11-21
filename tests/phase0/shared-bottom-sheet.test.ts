import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { bottomSheetTokens } from '../../src/shared/theme/component-tokens';
import { opacity, size } from '../../src/shared/theme/primitives';
import { radius, space } from '../../src/shared/theme/tokens';

test('shared bottom-sheet geometry aliases central primitives and semantic tokens', () => {
  assert.equal(bottomSheetTokens.topCornerRadius, radius.xl);
  assert.equal(bottomSheetTokens.topCornerRadius, size.dp24);
  assert.equal(bottomSheetTokens.maxHeight, '90%');
  assert.equal(bottomSheetTokens.backdropOpacity, opacity.bottomSheetBackdrop);
  assert.equal(opacity.bottomSheetBackdrop, 0.45);
  assert.equal(bottomSheetTokens.handleWidth, space.xxxl);
  assert.equal(bottomSheetTokens.handleHeight, space.xxs);
  assert.equal(bottomSheetTokens.handleRadius, radius.pill);
  assert.equal(bottomSheetTokens.handleTopMargin, space.xs);
  assert.equal(bottomSheetTokens.handleBottomMargin, size.dp0);
  assert.equal(bottomSheetTokens.headerMinHeight, size.dp48);
  assert.equal(bottomSheetTokens.headerHorizontalPadding, space.lg);
  assert.equal(bottomSheetTokens.headerDividerWidth, size.dp1);
});

test('one shared shell owns modal presentation and both feature and fixture compose it', () => {
  const shared = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  const feature = readFileSync('src/features/settings/appearance-sheet.tsx', 'utf8');
  const fixture = readFileSync('tests/fixtures/example-bottom-sheet.tsx', 'utf8');
  const provider = readFileSync('src/shared/theme/theme-provider.tsx', 'utf8');

  assert.match(shared, /export function AppBottomSheet/);
  assert.match(shared, /children: ReactNode/);
  assert.match(shared, /visible: boolean/);
  assert.match(shared, /onDismiss: \(\) => void/);
  assert.match(shared, /dismissAccessibilityLabel: string/);
  assert.match(shared, /<Modal/);
  assert.match(shared, /animationType="slide"/);
  assert.match(shared, /onRequestClose=\{onDismiss\}/);
  assert.match(shared, /onAccessibilityEscape=\{onDismiss\}/);
  assert.match(shared, /accessibilityViewIsModal/);
  assert.match(shared, /accessibilityLabel=\{dismissAccessibilityLabel\}/);
  assert.equal(shared.match(/onPress=\{onDismiss\}/g)?.length, 1);
  assert.match(shared, /StyleSheet\.absoluteFill/);
  assert.match(shared, /opacity: sheet\.backdropOpacity/);
  assert.match(shared, /maxHeight: sheet\.maxHeight/);
  assert.match(shared, /borderTopLeftRadius: sheet\.topCornerRadius/);
  assert.match(shared, /borderTopRightRadius: sheet\.topCornerRadius/);
  assert.match(shared, /overflow: 'hidden'/);
  const surface = shared.split('<SafeAreaView')[1]?.split('>')[0] ?? '';
  assert.doesNotMatch(surface, /borderTopWidth|borderTopColor|borderLeftWidth|borderRightWidth/);
  assert.match(shared, /handleWidth/);
  assert.match(shared, /handleTopMargin/);
  assert.match(shared, /headerMinHeight/);
  assert.match(shared, /headerDividerWidth/);
  assert.match(shared, /textAlign: 'center'/);
  assert.match(shared, /\{children\}/);
  assert.doesNotMatch(shared, /useState|expo-sqlite|Storage\.|useRouter|onPress=\{dismiss\}/);
  assert.match(provider, /bottomSheet: bottomSheetTokens/);

  assert.match(feature, /<AppBottomSheet/);
  assert.match(feature, /dismissAccessibilityLabel=\{t\('closeAppearance'\)\}/);
  assert.match(feature, /accessibilityRole="radiogroup"/);
  assert.match(feature, /APPEARANCE_OPTIONS\.map/);
  assert.doesNotMatch(feature, /<Modal|<SafeAreaView|StyleSheet\.absoluteFill/);
  assert.match(fixture, /<AppBottomSheet/);
  assert.match(fixture, /title="Example"/);
  assert.match(fixture, /<AppText>Independent test-only content<\/AppText>/);
  assert.doesNotMatch(fixture, /MoreUiState|AppearancePreference/);
});
