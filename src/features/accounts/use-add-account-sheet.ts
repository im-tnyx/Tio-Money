import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Keyboard } from 'react-native';

import { BUILT_IN_ACCOUNT_GROUPS } from '@/features/settings';
import { CURRENCY_OPTIONS } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';

import {
  newAccountAddSession,
  reconcileAccountAddCurrencies,
  updateAccountAddSession,
  type AccountAddAction,
  type AccountAddSession,
} from './account-add-session';
import {
  accountCurrencyChoices,
  draftCurrencies,
  isPreviewGroup,
  paymentModeAvailability,
  type AddAccountSheetViewModel,
} from './account-form-contract';

export function useAddAccountSheet(): {
  readonly sheet: AddAccountSheetViewModel;
  readonly open: () => void;
} {
  const { preferences } = useCurrencySettings();
  const reduceMotion = useReducedMotion();
  const currencies = draftCurrencies(preferences);
  const [session, setSession] = useState<AccountAddSession | null>(null);

  useFocusEffect(useCallback(() => () => setSession(null), [setSession]));

  const reconcile = (previous: AccountAddSession) =>
    reconcileAccountAddCurrencies(previous, preferences.mainCode, currencies);
  const current = session ? reconcile(session) : null;
  // Keep reconciled amounts cleared even if the removed currency is added back later.
  if (current !== session) setSession(current);

  function dispatch(action: AccountAddAction) {
    setSession((previous) =>
      previous
        ? updateAccountAddSession(reconcile(previous), action, preferences.mainCode, currencies)
        : previous,
    );
  }

  let content: AddAccountSheetViewModel['content'] = null;
  if (current?.phase === 'group') {
    content = {
      kind: 'group',
      choices: BUILT_IN_ACCOUNT_GROUPS.map(({ id, label, detail }) =>
        isPreviewGroup(id)
          ? { id, label, detail, onSelect: () => dispatch({ type: 'group.select', group: id }) }
          : { id, label, detail, status: 'accountInsuranceInformational' },
      ),
    };
  } else if (current?.phase === 'form') {
    const { draft } = current;
    const modeAvailability = draft.group === 'bank' ? paymentModeAvailability(draft) : null;
    content = {
      kind: 'form',
      form: {
        draft,
        currencySymbol:
          CURRENCY_OPTIONS.find(({ code }) => code === draft.currency)?.symbol ?? draft.currency,
        currencyChoices:
          accountCurrencyChoices(draft, currencies)?.map((value) => ({
            value,
            label: value,
            symbol: CURRENCY_OPTIONS.find(({ code }) => code === value)?.symbol ?? value,
          })) ?? null,
        showWalletFunding: draft.group === 'wallet' && draft.walletKind === 'funded',
        canAddMode: modeAvailability?.canAdd ?? false,
        canApplyMode: modeAvailability?.canApply ?? false,
        availableModeTypes: modeAvailability?.availableTypes ?? [],
        onAction: (action) => {
          if (
            action.type === 'mode.open' ||
            action.type === 'mode.apply' ||
            action.type === 'mode.cancel'
          ) {
            Keyboard.dismiss();
          }
          dispatch({ type: 'form', group: draft.group, action });
        },
      },
    };
  }

  return {
    open: () => setSession((previous) => previous ?? newAccountAddSession()),
    sheet: {
      animate: !reduceMotion,
      content,
      onDismiss: () => {
        Keyboard.dismiss();
        setSession(null);
      },
    },
  };
}
