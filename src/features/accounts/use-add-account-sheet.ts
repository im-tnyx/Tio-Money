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

  useFocusEffect(useCallback(() => () => setSession(null), []));

  const reconcile = (previous: AccountAddSession) =>
    reconcileAccountAddCurrencies(previous, preferences.mainCode, currencies);
  const current = session ? reconcile(session) : null;
  // Reconcile inactive group drafts too, so re-adding a removed currency cannot revive amounts.
  if (current !== session) setSession(current);

  const group = current?.group;
  const draft = current?.group ? current.drafts[current.group] : undefined;
  const modeAvailability = draft?.group === 'bank' ? paymentModeAvailability(draft) : null;

  function dispatch(action: AccountAddAction) {
    setSession((previous) =>
      previous
        ? updateAccountAddSession(reconcile(previous), action, preferences.mainCode, currencies)
        : previous,
    );
  }

  return {
    open: () => setSession((previous) => previous ?? newAccountAddSession()),
    sheet: {
      visible: current !== null,
      animate: !reduceMotion,
      selectedLabel:
        BUILT_IN_ACCOUNT_GROUPS.find(({ id }) => id === group)?.label ?? 'selectAccountGroup',
      groupPicker: current?.groupPickerOpen
        ? {
            choices: BUILT_IN_ACCOUNT_GROUPS.map(({ id, label, detail }) => ({
              id,
              label,
              detail,
              checked: id === group,
              status: isPreviewGroup(id) ? undefined : 'accountInsuranceInformational',
              onSelect: isPreviewGroup(id)
                ? () => dispatch({ type: 'group.select', group: id })
                : undefined,
            })),
            onDismiss: () => dispatch({ type: 'group.close' }),
          }
        : null,
      onOpenGroupPicker: () => {
        Keyboard.dismiss();
        dispatch({ type: 'group.open' });
      },
      onDismiss: () => {
        Keyboard.dismiss();
        setSession(null);
      },
      form: draft
        ? {
            draft,
            currencySymbol:
              CURRENCY_OPTIONS.find(({ code }) => code === draft.currency)?.symbol ??
              draft.currency,
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
          }
        : null,
    },
  };
}
