import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  getSwipeOffset,
  isHorizontalSwipe,
  shouldCloseRevealedSwipe,
  snapSwipeOffset,
} from '../../src/features/settings/sub-currency-swipe';

const read = (path: string) => readFileSync(path, 'utf8');

test('Account Groups reuse Sub Currency bounded horizontal swipe without blocking scroll', () => {
  assert.equal(isHorizontalSwipe(-45, 6, 8), true);
  assert.equal(isHorizontalSwipe(3, 50, 8), false);
  assert.equal(getSwipeOffset(0, -150, 88), 88);
  assert.equal(getSwipeOffset(88, 170, 88), 0);
  assert.equal(snapSwipeOffset(50, 88), 88);
  assert.equal(snapSwipeOffset(40, 88), 0);
  assert.equal(shouldCloseRevealedSwipe(88, 24, 2, 8), true);
  const swipe = read('src/features/settings/use-account-group-swipe-controller.ts');
  const route = read('src/features/settings/account-groups-route.tsx');
  assert.match(swipe, /isHorizontalSwipe/);
  assert.match(swipe, /getSwipeOffset/);
  assert.match(swipe, /snapSwipeOffset/);
  assert.match(swipe, /shouldCloseRevealedSwipe/);
  assert.match(swipe, /setCardTouchActive\(true\)/);
  assert.match(swipe, /setCardTouchActive\(false\)/);
  assert.match(route, /useAccountGroupSwipeController/);
  assert.match(route, /gestureEnabled: !swipe\.cardTouchActive/);
});

test('swipe reveals Delete only on custom rows; tap edits; built-ins stay read-only', () => {
  const screen = read('src/features/settings/account-groups-screen.tsx');
  const vm = read('src/features/settings/use-account-groups-view-model.ts');
  const contract = read('src/features/settings/account-groups-contract.ts');
  const shared = read('src/shared/ui/app-bottom-sheet.tsx');

  const builtin =
    screen.split('BUILT_IN_ACCOUNT_GROUPS.map')[1]?.split('state.customGroups.map')[0] ?? '';
  const custom =
    screen.split('state.customGroups.map')[1]?.split('</SwipeableCustomGroupRow>')[0] ?? '';
  assert.doesNotMatch(builtin, /SwipeableCustomGroupRow|custom\.edit|custom\.remove/);
  assert.match(custom, /SwipeableCustomGroupRow/);
  assert.match(custom, /type: 'custom\.remove'/);
  assert.match(custom, /type: 'custom\.edit'/);
  assert.match(custom, /name: 'delete'/);
  assert.match(screen, /function SwipeableCustomGroupRow/);
  assert.match(screen, /onMoveShouldSetResponderCapture/);
  assert.match(screen, /onResponderRelease/);
  assert.match(screen, /translateX: -displayedOffset/);
  assert.match(screen, /theme\.colors\.deleteActionBackground/);
  assert.match(screen, /accountGroupsDelete/);
  assert.match(screen, /accountGroupsHideDelete/);
  assert.match(contract, /renamingGroupId: string \| null/);
  assert.match(contract, /type: 'custom\.edit'/);
  assert.match(contract, /type: 'custom\.remove'/);
  assert.match(vm, /renameCustomGroupLabel/);
  assert.match(vm, /removeCustomGroupLabel/);
  assert.match(vm, /accountGroupPreferenceStore\.write\(next\)/);
  assert.match(vm, /accountGroupPreferenceStore\.write\(result\.preferences\)/);
  assert.match(vm, /setRenamingGroupId\(group\.id\)/);
  assert.match(vm, /setDraftName\(group\.name\)/);
  assert.match(vm, /if \(catalog\.storageBlocked\) return/);
  assert.match(vm, /setError\(t\('accountGroupsSaveError'\)\)/);
  assert.match(screen, /state\.renamingGroupId === null/);
  assert.match(screen, /accountGroupsRename/);
  assert.equal((screen.match(/<AppBottomSheet/g) ?? []).length, 1);
  assert.equal((screen.match(/<ActionButton/g) ?? []).length, 1);
  assert.match(screen, /avoidKeyboard/);
  assert.match(shared, /underlayBehindKeyboard/);
  assert.doesNotMatch(screen, /useState|useEffect|useRef|Storage\.|sqlite|fetch\(/);
});
