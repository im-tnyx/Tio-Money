import { useNavigation, useRouter, type NativeStackNavigationProp } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { BUILT_IN_ACCOUNT_GROUPS } from '@/features/settings';
import { CURRENCY_OPTIONS } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';

import {
  newAccountAddSession,
  presentInitialAccountGroupPicker,
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
  type AddAccountScreenViewModel,
} from './account-form-contract';

export function useAddAccountViewModel(): AddAccountScreenViewModel {
  const navigation = useNavigation<NativeStackNavigationProp<{ 'add-account': undefined }>>();
  const router = useRouter();
  const { preferences } = useCurrencySettings();
  const reduceMotion = useReducedMotion();
  const currencies = draftCurrencies(preferences);
  const [session, setSession] = useState(() =>
    newAccountAddSession(reduceMotion || Platform.OS === 'web'),
  );

  useLayoutEffect(
    () =>
      navigation.addListener('transitionEnd', ({ data }) => {
        if (!data.closing && navigation.isFocused()) setSession(presentInitialAccountGroupPicker);
      }),
    [navigation, setSession],
  );

  const reconcile = (previous: AccountAddSession) =>
    reconcileAccountAddCurrencies(previous, preferences.mainCode, currencies);
  const current = reconcile(session);
  // Keep reconciled amounts cleared even if the removed currency is added back later.
  if (current !== session) setSession(current);

  function dispatch(action: AccountAddAction) {
    setSession((previous) =>
      updateAccountAddSession(reconcile(previous), action, preferences.mainCode, currencies),
    );
  }

  const group = current.group;
  const draft = group === null ? undefined : current.drafts[group];
  const modeAvailability = draft?.group === 'bank' ? paymentModeAvailability(draft) : null;

  return {
    animateSheet: !reduceMotion,
    groupLabel:
      BUILT_IN_ACCOUNT_GROUPS.find(({ id }) => id === group)?.label ?? 'selectAccountGroup',
    groupChoices:
      current.groupPicker === 'open'
        ? BUILT_IN_ACCOUNT_GROUPS.map(({ id, label, detail }) =>
            isPreviewGroup(id)
              ? {
                  id,
                  label,
                  detail,
                  selected: id === group,
                  onSelect: () => dispatch({ type: 'group.select', group: id }),
                }
              : { id, label, detail, status: 'accountInsuranceInformational' },
          )
        : null,
    onOpenGroupPicker: () => {
      Keyboard.dismiss();
      dispatch({ type: 'group.open' });
    },
    onCloseGroupPicker: () => dispatch({ type: 'group.close' }),
    onClose: () => {
      Keyboard.dismiss();
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/accounts');
    },
    form: draft
      ? {
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
        }
      : null,
  };
}
