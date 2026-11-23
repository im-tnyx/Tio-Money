import { en } from '@/shared/i18n/strings';

import { BUILT_IN_ACCOUNT_GROUPS } from './account-group-templates';

/** Display-only preferences, never ledger group types or financial accounts. */
export const MAX_CUSTOM_GROUPS = 5;
export const MAX_CUSTOM_GROUP_NAME_LENGTH = 20;

export interface CustomGroupLabel {
  readonly id: string;
  readonly name: string;
}
export interface AccountGroupPreferences {
  readonly version: 1;
  readonly showDescriptions: boolean;
  readonly customGroups: readonly CustomGroupLabel[];
}
export interface AccountGroupPreferenceStore {
  read(): AccountGroupPreferences;
  write(value: AccountGroupPreferences): void;
}

export const DEFAULT_ACCOUNT_GROUP_PREFERENCES: AccountGroupPreferences = {
  version: 1,
  showDescriptions: false,
  customGroups: [],
};

const builtInNames = new Set(
  BUILT_IN_ACCOUNT_GROUPS.map((group) => en[group.label].toLocaleLowerCase('en')),
);

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

function validName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_CUSTOM_GROUP_NAME_LENGTH &&
    value === normalizeName(value) &&
    !/[\p{Cc}\p{Cf}]/u.test(value)
  );
}

export function isAccountGroupPreferences(value: unknown): value is AccountGroupPreferences {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AccountGroupPreferences>;
  if (
    candidate.version !== 1 ||
    typeof candidate.showDescriptions !== 'boolean' ||
    !Array.isArray(candidate.customGroups) ||
    candidate.customGroups.length > MAX_CUSTOM_GROUPS
  ) {
    return false;
  }
  const seen = new Set(builtInNames);
  return candidate.customGroups.every((group, index) => {
    if (!group || typeof group !== 'object') return false;
    const record = group as Partial<CustomGroupLabel>;
    if (record.id !== `custom-${index + 1}` || !validName(record.name)) return false;
    const key = record.name.toLocaleLowerCase('en');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseAccountGroupPreferences(raw: string | null): AccountGroupPreferences {
  if (raw === null) return DEFAULT_ACCOUNT_GROUP_PREFERENCES;
  const parsed: unknown = JSON.parse(raw);
  if (!isAccountGroupPreferences(parsed)) throw new Error('Invalid account groups preferences');
  return parsed;
}

export type GroupAddResult =
  | { readonly ok: true; readonly preferences: AccountGroupPreferences }
  | { readonly ok: false; readonly error: 'limit' | 'name' | 'duplicate' };

export function addCustomGroupLabel(
  current: AccountGroupPreferences,
  input: string,
): GroupAddResult {
  if (!isAccountGroupPreferences(current)) throw new Error('Invalid current account group state');
  if (current.customGroups.length >= MAX_CUSTOM_GROUPS) return { ok: false, error: 'limit' };
  const name = normalizeName(input);
  if (!validName(name)) return { ok: false, error: 'name' };
  const foldedName = name.toLocaleLowerCase('en');
  const duplicate =
    builtInNames.has(foldedName) ||
    current.customGroups.some((group) => group.name.toLocaleLowerCase('en') === foldedName);
  if (duplicate) return { ok: false, error: 'duplicate' };
  const customGroup = { id: `custom-${current.customGroups.length + 1}`, name };
  return {
    ok: true,
    preferences: {
      ...current,
      customGroups: [...current.customGroups, customGroup],
    },
  };
}

/** Preserve the v1 display-only ID invariant after deleting an arbitrary custom row. */
export function removeCustomGroupLabel(
  current: AccountGroupPreferences,
  id: string,
): AccountGroupPreferences {
  if (!isAccountGroupPreferences(current)) throw new Error('Invalid current account group state');
  const remaining = current.customGroups.filter((group) => group.id !== id);
  if (remaining.length === current.customGroups.length) return current;
  return {
    ...current,
    customGroups: remaining.map((group, index) => ({
      id: `custom-${index + 1}`,
      name: group.name,
    })),
  };
}

export type GroupRenameResult =
  | { readonly ok: true; readonly preferences: AccountGroupPreferences }
  | { readonly ok: false; readonly error: 'name' | 'duplicate' | 'missing' };

/** Rename only a saved custom display label; built-in templates never enter this collection. */
export function renameCustomGroupLabel(
  current: AccountGroupPreferences,
  id: string,
  input: string,
): GroupRenameResult {
  if (!isAccountGroupPreferences(current)) throw new Error('Invalid current account group state');
  const target = current.customGroups.find((group) => group.id === id);
  if (!target) return { ok: false, error: 'missing' };
  const name = normalizeName(input);
  if (!validName(name)) return { ok: false, error: 'name' };
  const key = name.toLocaleLowerCase('en');
  if (
    builtInNames.has(key) ||
    current.customGroups.some(
      (group) => group.id !== id && group.name.toLocaleLowerCase('en') === key,
    )
  ) {
    return { ok: false, error: 'duplicate' };
  }
  if (target.name === name) return { ok: true, preferences: current };
  return {
    ok: true,
    preferences: {
      ...current,
      customGroups: current.customGroups.map((group) =>
        group.id === id ? { ...group, name } : group,
      ),
    },
  };
}
