import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('TM-CUR-025: More Main/Sub Currency share one card with one inset divider', () => {
  const more = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const start = more.indexOf('<AppText variant="section">{t(\'currency\')}</AppText>');
  const finish = more.indexOf('{state.error && !state.appearanceSheetVisible', start);
  assert.ok(start >= 0 && finish > start);
  const section = more.slice(start, finish);
  const cardStyle = more.match(/const settingsCardStyle = \{([\s\S]*?)\} as const/)?.[1];
  const dividerStyle = more.match(/const settingsDividerStyle = \{([\s\S]*?)\};/)?.[1];
  assert.ok(cardStyle);
  assert.ok(dividerStyle);
  assert.equal(section.match(/<Pressable/g)?.length, 2);
  assert.equal(section.match(/<View style=\{settingsCardStyle\}>/g)?.length, 1);
  assert.equal(
    section.match(/<View accessible=\{false\} style=\{settingsDividerStyle\} \/>/g)?.length,
    1,
  );
  assert.match(cardStyle, /backgroundColor: theme\.colors\.card/);
  assert.match(cardStyle, /borderTopWidth: theme\.navigation\.borderWidth/);
  assert.match(cardStyle, /borderBottomWidth: theme\.navigation\.borderWidth/);
  assert.match(dividerStyle, /marginLeft: theme\.space\.lg/);
  assert.match(dividerStyle, /borderBottomWidth: theme\.navigation\.borderWidth/);
  assert.match(section, /onAction\(\{ type: 'currency.main.open' \}\)/);
  assert.match(section, /onAction\(\{ type: 'currency.sub.open' \}\)/);
  assert.match(section, /accessibilityLabel=\{t\('currencyMain'\)\}/);
  assert.match(section, /accessibilityLabel=\{t\('currencySub'\)\}/);
  assert.match(section, /\{state.currency.mainCode\}/);
  assert.match(section, /state.currency.subCodes.length === 0/);
  assert.doesNotMatch(section + cardStyle + dividerStyle, /backgroundColor: '#|#[0-9a-fA-F]{6}/);
});
