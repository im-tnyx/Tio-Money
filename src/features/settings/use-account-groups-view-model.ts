import { useCallback, useState } from 'react';

import { accountGroupPreferenceStore } from '@/data/preferences/account-group-preference-store';
import { t } from '@/shared/i18n/strings';

import {
  DEFAULT_ACCOUNT_GROUP_PREFERENCES,
  MAX_CUSTOM_GROUPS,
  addCustomGroupLabel,
  type AccountGroupPreferences,
} from './account-group-preferences';
import type { AccountGroupsAction, AccountGroupsUiState } from './account-groups-contract';

interface LoadedCatalog {
  readonly preferences: AccountGroupPreferences;
  readonly storageBlocked: boolean;
}

function readCatalog(): LoadedCatalog {
  try {
    return { preferences: accountGroupPreferenceStore.read(), storageBlocked: false };
  } catch {
    // Fail closed; never overwrite unknown or malformed local UI preferences.
    return { preferences: DEFAULT_ACCOUNT_GROUP_PREFERENCES, storageBlocked: true };
  }
}

const addErrors = {
  limit: 'accountGroupsLimitReached',
  name: 'accountGroupsInvalidName',
  duplicate: 'accountGroupsDuplicate',
} as const;

/** All UI flow, input validation and local preference writes remain outside screens. */
export function useAccountGroupsViewModel(onBack: () => void): {
  readonly state: AccountGroupsUiState;
  readonly onAction: (action: AccountGroupsAction) => void;
} {
  const [catalog, setCatalog] = useState<LoadedCatalog>(readCatalog);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAction = useCallback(
    (action: AccountGroupsAction) => {
      switch (action.type) {
        case 'back':
          onBack();
          return;
        case 'descriptions.toggle': {
          if (catalog.storageBlocked) return;
          const next: AccountGroupPreferences = {
            ...catalog.preferences,
            showDescriptions: !catalog.preferences.showDescriptions,
          };
          try {
            accountGroupPreferenceStore.write(next);
            setCatalog({ preferences: next, storageBlocked: false });
            setError(null);
          } catch {
            setError(t('accountGroupsSaveError'));
          }
          return;
        }
        case 'custom.open':
          if (catalog.storageBlocked || catalog.preferences.customGroups.length >= MAX_CUSTOM_GROUPS) return;
          setDraftName('');
          setDraftError(null);
          setAddSheetVisible(true);
          return;
        case 'custom.dismiss':
          setDraftName('');
          setDraftError(null);
          setAddSheetVisible(false);
          return;
        case 'custom.name':
          setDraftName(action.name);
          setDraftError(null);
          return;
        case 'custom.save': {
          if (catalog.storageBlocked || !addSheetVisible) return;
          const result = addCustomGroupLabel(catalog.preferences, draftName);
          if (!result.ok) {
            setDraftError(t(addErrors[result.error]));
            return;
          }
          try {
            accountGroupPreferenceStore.write(result.preferences);
            setCatalog({ preferences: result.preferences, storageBlocked: false });
            setDraftName('');
            setDraftError(null);
            setAddSheetVisible(false);
            setError(null);
          } catch {
            setDraftError(t('accountGroupsSaveError'));
          }
          return;
        }
      }
    },
    [onBack, catalog, addSheetVisible, draftName],
  );

  return {
    state: {
      showDescriptions: catalog.preferences.showDescriptions,
      customGroups: catalog.preferences.customGroups,
      storageBlocked: catalog.storageBlocked,
      canAdd: !catalog.storageBlocked && catalog.preferences.customGroups.length < MAX_CUSTOM_GROUPS,
      addSheetVisible,
      draftName,
      draftError,
      error: catalog.storageBlocked ? t('accountGroupsLoadError') : error,
    },
    onAction,
  };
}
