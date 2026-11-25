import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buttonTokens } from '../../src/shared/theme/component-tokens';
import { size } from '../../src/shared/theme/primitives';

test('ActionButton supports 42dp default and 32dp small surfaces with a 48dp target', () => {
  assert.equal(buttonTokens.actionHeight, size.dp42);
  assert.equal(buttonTokens.smallActionHeight, size.dp32);
  assert.equal(buttonTokens.minimumHeight, size.dp48);
  const button = readFileSync('src/shared/ui/action-button.tsx', 'utf8');
  assert.match(button, /<Pressable/);
  assert.match(button, /minHeight: theme\.buttons\.minimumHeight/);
  assert.match(button, /<View/);
  assert.match(button, /size = 'default'/);
  assert.match(
    button,
    /minHeight:\s*size === 'small'\s*\? theme\.buttons\.smallActionHeight\s*:\s*theme\.buttons\.actionHeight/,
  );
  assert.match(button, /accessibilityRole="button"/);
  assert.match(button, /disabled=\{isDisabled\}/);
  assert.match(button, /loading \? \(/);
  assert.doesNotMatch(button, /height: 42|minHeight: 42|height: 48|minHeight: 48/);
});
