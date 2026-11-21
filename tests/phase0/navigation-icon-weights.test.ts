import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import navIconSvg from '../../src/shared/assets/google-material-icons/root-tab-icon-svg.json';
import { ROOT_DESTINATIONS } from '../../src/shared/navigation/root-destinations';
import { navigationTokens } from '../../src/shared/theme/component-tokens';

test('five navigation icons use exact selected and unselected Google artwork', () => {
  assert.equal(navigationTokens.selectedIconWeight, 400);
  assert.equal(navigationTokens.unselectedIconWeight, 200);
  assert.deepEqual(
    Object.keys(navIconSvg).sort(),
    ROOT_DESTINATIONS.map((item) => item.icon).sort(),
  );

  for (const destination of ROOT_DESTINATIONS) {
    const name = destination.icon;
    const prefix = 'src/shared/assets/google-material-icons/';
    const unselected = readFileSync(prefix + name + '.svg', 'utf8');
    const selected = readFileSync(prefix + name + '-selected.svg', 'utf8');
    assert.equal(navIconSvg[name]['200'], unselected);
    assert.equal(navIconSvg[name]['400'], selected);
    assert.notEqual(selected, unselected);
  }
});

test('navigation active state chooses artwork without changing layout or routes', () => {
  const tabBar = readFileSync('src/shared/ui/root-tab-bar.tsx', 'utf8');
  const icon = readFileSync('src/shared/ui/root-tab-icon.tsx', 'utf8');

  assert.match(tabBar, /selected=\{active\}/);
  assert.match(tabBar, /accessibilityState=\{\{ selected: active \}\}/);
  assert.match(icon, /selected \? navigationTokens\.selectedIconWeight/);
  assert.match(icon, /: navigationTokens\.unselectedIconWeight/);
  assert.match(icon, /navIconSvg\[name\]\[weight\]\.replace/);
  assert.match(icon, /width=\{iconTokens\.size\} height=\{iconTokens\.size\}/);
  assert.doesNotMatch(icon, /useState|router\.|setState|fontFamily|strokeWidth/);
});
