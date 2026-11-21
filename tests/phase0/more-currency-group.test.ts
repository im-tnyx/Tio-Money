import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('TM-CUR-025: More Main/Sub Currency share one card with one inset divider', () => {
  const more = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const start = more.indexOf('<AppText variant="section">{t(\'currency\')}</AppText>');
  const finish = more.indexOf('{state.error && !state.appearanceSheetVisible', start);
  assert.ok(start >= 0 && finish > start);
  const section = more.slice(start, finish);
  assert.equal(section.match(/<Pressable/g)?.length, 2);
  assert.equal(section.match(/backgroundColor: theme.colors.card/g)?.length, 1);
  assert.equal(section.match(/borderTopWidth: theme.navigation.borderWidth/g)?.length, 1);
  assert.equal(section.match(/borderBottomWidth: theme.navigation.borderWidth/g)?.length, 2);
  assert.match(section, /marginLeft: theme.space.lg/);
  assert.match(section, /accessible=\{false\}/);
  assert.match(section, /onAction\(\{ type: 'currency.main.open' \}\)/);
  assert.match(section, /onAction\(\{ type: 'currency.open' \}\)/);
  assert.match(section, /accessibilityLabel=\{t\('currencyMain'\)\}/);
  assert.match(section, /accessibilityLabel=\{t\('currencySub'\)\}/);
  assert.match(section, /\{state.currency.mainCode\}/);
  assert.match(section, /\{state.currency.subCode \?\? t\('currencyNone'\)\}/);
  assert.doesNotMatch(section, /backgroundColor: '#|#[0-9a-fA-F]{6}/);
});
