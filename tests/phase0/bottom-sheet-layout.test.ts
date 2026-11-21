import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { bottomSheetTokens } from '../../src/shared/theme/component-tokens';
import {
  getBottomSheetHeightLimits,
  getDraggedBottomSheetHeight,
  hasOverflowingSheetContent,
  shouldExpandBottomSheet,
} from '../../src/shared/ui/bottom-sheet-geometry';

test('bottom sheet limits restore 90 percent initial cap and preserve top safe area', () => {
  const bounds = getBottomSheetHeightLimits(800, 48, bottomSheetTokens);
  assert.deepEqual(bounds, { collapsedMax: 720, expandedMax: 740 });
  const { collapsedMax, expandedMax } = bounds;
  assert.equal(getDraggedBottomSheetHeight(400, -160, collapsedMax, expandedMax), 560);
  assert.equal(getDraggedBottomSheetHeight(400, -700, collapsedMax, expandedMax), 740);
  assert.equal(getDraggedBottomSheetHeight(400, 160, collapsedMax, expandedMax), 400);
  assert.equal(getDraggedBottomSheetHeight(740, 200, collapsedMax, expandedMax), 720);
  assert.equal(shouldExpandBottomSheet(false, -32, 32), true);
  assert.equal(shouldExpandBottomSheet(true, 32, 32), false);
  assert.equal(shouldExpandBottomSheet(true, -10, 32), true);
});

test('visible handle and title stay unchanged; invisible drag target takes no space', () => {
  const shell = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  assert.match(shell, /height: sheet\.handleHeight/);
  assert.match(shell, /marginTop: sheet\.handleTopMargin/);
  assert.match(shell, /marginBottom: sheet\.handleBottomMargin/);
  assert.match(shell, /minHeight: sheet\.headerMinHeight/);
  assert.match(shell, /position: 'absolute'/);
  assert.match(shell, /width: sheet\.handleTouchWidth/);
  assert.match(shell, /height: sheet\.handleTouchHeight/);
  assert.match(shell, /onResponderMove/);
  assert.match(shell, /onResponderRelease/);
});

test('all sheets share one bottom-safe scroll area and expose final options', () => {
  const shell = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  const main = readFileSync('src/features/settings/main-currency-option-sheet.tsx', 'utf8');
  const appearance = readFileSync('src/features/settings/appearance-sheet.tsx', 'utf8');
  assert.equal(shell.match(/<ScrollView/g)?.length, 1);
  assert.match(shell, /nestedScrollEnabled/);
  assert.match(shell, /paddingBottom: scrollBottomPadding/);
  assert.match(shell, /edges=\{\['bottom', 'left', 'right'\]\}/);
  assert.doesNotMatch(main, /<ScrollView|maxHeight: '70%'/);
  assert.match(main, /<AppBottomSheet/);
  const subPicker = readFileSync('src/features/settings/sub-currency-option-sheet.tsx', 'utf8');
  assert.match(subPicker, /<AppBottomSheet/);
  assert.doesNotMatch(subPicker, /<ScrollView/);
  assert.match(appearance, /<AppBottomSheet/);
  assert.equal(bottomSheetTokens.contentBottomPadding, 24);
  assert.equal(bottomSheetTokens.handleTouchHeight, 48);
});

test('short Decimal and Format sheets reserve bottom safe inset without clipping choices', () => {
  const shell = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  const main = readFileSync('src/features/settings/main-currency-option-sheet.tsx', 'utf8');
  assert.match(shell, /top: topInset, bottom: bottomInset/);
  assert.match(shell, /const contentMaxHeight = Math\.max\(/);
  assert.match(shell, /maxHeight: contentMaxHeight/);
  assert.match(shell, /flexGrow: expandedForContent \|\| draggedForContent !== null \? 1 : 0/);
  assert.match(shell, /paddingBottom: scrollBottomPadding/);
  assert.doesNotMatch(shell, /paddingBottom: sheet\.contentBottomPadding \+ bottomInset/);
  assert.match(shell, /height: sheet\.handleHeight/);
  assert.match(shell, /minHeight: sheet\.headerMinHeight/);
  assert.match(main, /state\.choices\.map/);
  assert.doesNotMatch(main, /maxHeight: '70%'|<ScrollView/);
});

test('only overflowing sheets can expand; short sheets remain at the bottom', () => {
  const limits = getBottomSheetHeightLimits(800, 48, bottomSheetTokens);
  const bottomInset = 24;
  const chrome =
    bottomSheetTokens.handleHeight +
    bottomSheetTokens.handleTopMargin +
    bottomSheetTokens.handleBottomMargin +
    bottomSheetTokens.headerMinHeight +
    bottomSheetTokens.headerDividerWidth +
    bottomInset;
  const fitHeight = limits.collapsedMax - chrome;
  assert.equal(hasOverflowingSheetContent(250, fitHeight), false);
  assert.equal(hasOverflowingSheetContent(fitHeight, fitHeight), false);
  assert.equal(hasOverflowingSheetContent(900, fitHeight), true);
  const shell = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  assert.match(shell, /onContentSizeChange/);
  assert.match(shell, /const canExpand = hasOverflowingSheetContent/);
  assert.match(shell, /const expandedForContent = canExpand && expanded/);
  assert.match(shell, /const draggedForContent = canExpand \? dragHeight : null/);
  assert.match(
    shell,
    /scrollEnabled=\{hasOverflowingSheetContent\(contentHeight, contentMaxHeight\)\}/,
  );
  assert.match(shell, /\{canExpand \? \(/);
  assert.match(shell, /key=\{title\}/);
});

test('short sheets add zero extra space below options; long sheets retain scroll clearance', () => {
  const sheet = readFileSync('src/shared/ui/app-bottom-sheet.tsx', 'utf8');
  assert.match(sheet, /const canExpand = hasOverflowingSheetContent/);
  assert.match(sheet, /const scrollBottomPadding = canExpand/);
  assert.match(sheet, /sheet\.contentBottomPadding : theme\.navigation\.origin/);
  assert.match(sheet, /contentContainerStyle=\{\{ paddingBottom: scrollBottomPadding \}\}/);
  assert.match(sheet, /edges=\{\['bottom', 'left', 'right'\]\}/);
  assert.doesNotMatch(sheet, /paddingBottom: .*\+ bottomInset/);
  assert.equal(bottomSheetTokens.contentBottomPadding, 24);
  assert.equal(bottomSheetTokens.handleBottomMargin, 0);
});
