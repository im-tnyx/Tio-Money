import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buttonTokens } from '../../src/shared/theme/component-tokens';
import { size } from '../../src/shared/theme/primitives';

test('app-wide ActionButton is visually 42dp with 48dp accessible hit target', () => {
  assert.equal(buttonTokens.actionHeight, size.dp42);
  assert.equal(buttonTokens.minimumHeight, size.dp48);
  const button = readFileSync('src/shared/ui/action-button.tsx', 'utf8');
  assert.match(button, /<Pressable/);
  assert.match(button, /minHeight: theme\.buttons\.minimumHeight/);
  assert.match(button, /<View/);
  assert.match(button, /minHeight: theme\.buttons\.actionHeight/);
  assert.match(button, /accessibilityRole="button"/);
  assert.match(button, /disabled=\{isDisabled\}/);
  assert.match(button, /loading \? \(/);
  assert.doesNotMatch(button, /height: 42|minHeight: 42|height: 48|minHeight: 48/);
});
