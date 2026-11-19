import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const appConfig = JSON.parse(readFileSync('app.json', 'utf8')) as {
  expo: { plugins: string[]; android: { permissions: string[] }; platforms: string[] };
};

test('default configuration includes Expo Router and no SMS permissions', () => {
  assert.ok(appConfig.expo.plugins.includes('expo-router'));
  assert.deepEqual(appConfig.expo.android.permissions, []);
  assert.ok(appConfig.expo.platforms.includes('ios'));
  assert.ok(appConfig.expo.platforms.includes('android'));
});
