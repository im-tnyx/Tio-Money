import type { ColorScheme } from './tokens';

export const APPEARANCE_OPTIONS = ['system', 'light', 'dark'] as const;
export type AppearancePreference = (typeof APPEARANCE_OPTIONS)[number];

/** Invalid or missing local values never select an unexpected theme. */
export function parseAppearancePreference(value: unknown): AppearancePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveAppearanceScheme(
  preference: AppearancePreference,
  systemScheme: ColorScheme | null | undefined,
): ColorScheme {
  if (preference !== 'system') return preference;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

/** Storage details are supplied at the app composition root, not in UI. */
export interface AppearancePreferenceStore {
  read(): AppearancePreference;
  write(value: AppearancePreference): void;
}
