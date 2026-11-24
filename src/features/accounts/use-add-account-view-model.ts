import { useNavigation, useRouter, type NativeStackNavigationProp } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { BUILT_IN_ACCOUNT_GROUPS } from '@/features/settings';
import { CURRENCY_OPTIONS } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { t, type TranslationKey } from '@/shared/i18n/strings';
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
  investmentKinds,
  isPreviewGroup,
  loanDirections,
  paymentModeAvailability,
  walletKinds,
  type AccountChoiceAction,
  type AccountDraft,
  type AccountDraftChoice,
  type AddAccountScreenViewModel,
} from './account-form-contract';

const loanLabels = { borrowed: 'accountLoanBorrowed', given: 'accountLoanGiven' } as const;
const walletLabels = {
  funded: 'accountWalletFunded',
  'bank-linked': 'accountWalletLinked',
} as const;
const investmentLabels = {
  stocks: 'accountInvestmentStocks',
  mutualFunds: 'accountInvestmentMutualFunds',
  fixedDeposit: 'accountInvestmentFixedDeposit',
  gold: 'accountInvestmentGold',
  ppf: 'accountInvestmentPpf',
  other: 'accountInvestmentOther',
} as const;

function draftChoice(
  draft: AccountDraft,
  open: boolean,
  dispatch: (action: AccountAddAction) => void,
): AccountDraftChoice | null {
  function choice<Value extends string>(
    label: TranslationKey,
    values: readonly Value[],
    labels: Record<Value, TranslationKey>,
    selected: Value,
    select: (value: Value) => AccountChoiceAction,
  ): AccountDraftChoice {
    return {
      label,
      value: labels[selected],
      open,
      onOpen: () => {
        Keyboard.dismiss();
        dispatch({ type: 'options.open' });
      },
      onClose: () => dispatch({ type: 'options.close' }),
      options: values.map((value) => ({
        value,
        label: t(labels[value]),
        selected: value === selected,
        onSelect: () => dispatch({ type: 'options.select', choice: select(value) }),
      })),
    };
  }

  switch (draft.group) {
    case 'wallet':
      return choice('accountWalletKind', walletKinds, walletLabels, draft.walletKind, (value) => ({
        type: 'wallet.kind',
        value,
      }));
    case 'loan':
      return choice(
        'accountLoanDirection',
        loanDirections,
        loanLabels,
        draft.direction,
        (value) => ({
          type: 'loan.direction',
          value,
        }),
      );
    case 'investment':
      return choice(
        'accountInvestmentType',
        investmentKinds,
        investmentLabels,
        draft.investmentKind,
        (value) => ({ type: 'investment.kind', value }),
      );
    default:
      return null;
  }
}

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
          choice: draftChoice(draft, current.choicePickerOpen, dispatch),
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
