import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { en, t } from '../../src/shared/i18n/strings';

test('MVP exposes typed English messages only', () => {
  assert.equal(t('home'), 'Home');
  assert.equal(t('transactions'), 'Transactions');
  assert.equal(t('stats'), 'Statistics');
  assert.equal(t('more'), 'More');
  assert.equal(t('addTransaction'), 'Add transaction');
  assert.ok(Object.keys(en).length > 10);
});

test('no unused Hindi dictionary or MVP language picker is shipped', () => {
  const source = readFileSync('src/shared/i18n/strings.ts', 'utf8');
  assert.doesNotMatch(source, /const hi\s*:/);
  assert.doesNotMatch(source, /'en'\s*\|\s*'hi'/);
  const welcome = readFileSync('src/features/onboarding/welcome-screen.tsx', 'utf8');
  assert.doesNotMatch(welcome, /Language choice|Choose language|Select language/);
  const settings = readFileSync('src/features/settings/settings-screen.tsx', 'utf8');
  assert.doesNotMatch(settings, /Language selection|Choose language|Select language/);
});
