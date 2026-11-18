const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expo,
  {
    ignores: ['dist/**', '.expo/**', 'coverage/**', 'android/**', 'ios/**'],
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-*',
                'expo',
                'expo-*',
                'expo-router',
                'react-native',
                'react-native-*',
                '@/app/**',
                '@/features/**',
                '@/data/**',
                '@/platform/**',
              ],
              message: 'Financial domain must remain pure TypeScript.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['expo-sqlite', '@/data/sqlite/**', '@/platform/sms/native*'],
              message:
                'UI and feature controllers must use application ports, not SQLite/native adapters.',
            },
          ],
        },
      ],
    },
  },
]);
