import { useNavigation, useRouter, type NativeStackNavigationProp } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { BUILT_IN_ACCOUNT_GROUPS } from '@/features/settings';
import { CURRENCY_OPTIONS } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';
import type { AppDateFieldModel } from '@/shared/ui/app-date-field';
import type { AppDayOfMonthFieldModel } from '@/shared/ui/app-day-of-month-field';
import { localCalendarToday } from '@/shared/ui/calendar-date';

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
  loanDirections,
  paymentModeAvailability,
  type AccountChoiceAction,
  type AccountDraft,
  type AccountDraftChoice,
  type AddAccountScreenViewModel,
  type CardMonthDayField,
  type LoanDateField,
} from './account-form-contract';

const loanLabels = { borrowed: 'accountLoanBorrowed', given: 'accountLoanGiven' } as const;

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

  if (draft.group !== 'loan') return null;
  return choice('accountLoanDirection', loanDirections, loanLabels, draft.direction, (value) => ({
    type: 'loan.direction',
    value,
  }));
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
    const today = localCalendarToday();
    setSession((previous) =>
      updateAccountAddSession(reconcile(previous), action, preferences.mainCode, currencies, today),
    );
  }

  const group = current.group;
  const draft = group === null ? undefined : current.drafts[group];
  const modeAvailability = draft?.group === 'bank' ? paymentModeAvailability(draft) : null;

  function loanDate(field: LoanDateField, value: string): AppDateFieldModel {
    const picker = current.datePicker?.field === field ? current.datePicker : null;
    return {
      value,
      open: picker !== null,
      dayIndex: picker?.dayIndex,
      monthIndex: picker?.monthIndex,
      onOpen: () => {
        Keyboard.dismiss();
        dispatch({ type: 'date.open', field });
      },
      onClose: () => {
        if (picker) dispatch({ type: 'date.close', id: picker.id });
      },
      onChange: (part, value) => {
        if (picker) dispatch({ type: 'date.change', id: picker.id, part, value });
      },
    };
  }

  function cardDate(field: CardMonthDayField, value: string): AppDayOfMonthFieldModel {
    const picker = current.datePicker?.field === field ? current.datePicker : null;
    return {
      value,
      open: picker !== null,
      dayIndex: picker?.dayIndex,
      onOpen: () => {
        Keyboard.dismiss();
        dispatch({ type: 'date.open', field });
      },
      onClose: () => {
        if (picker) dispatch({ type: 'date.close', id: picker.id });
      },
      onChange: (wheelIndex) => {
        if (picker) {
          dispatch({ type: 'date.change', id: picker.id, part: 'day', value: wheelIndex });
        }
      },
    };
  }

  return {
    animateSheet: !reduceMotion,
    groupLabel:
      BUILT_IN_ACCOUNT_GROUPS.find(({ id }) => id === group)?.label ?? 'selectAccountGroup',
    groupChoices:
      current.groupPicker === 'open'
        ? BUILT_IN_ACCOUNT_GROUPS.flatMap(({ id, label, detail }) =>
            isPreviewGroup(id)
              ? [
                  {
                    id,
                    label,
                    detail,
                    selected: id === group,
                    onSelect: () => dispatch({ type: 'group.select', group: id }),
                  },
                ]
              : [],
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
            accountCurrencyChoices(currencies)?.map((value) => ({
              value,
              label: value,
              symbol: CURRENCY_OPTIONS.find(({ code }) => code === value)?.symbol ?? value,
            })) ?? null,
          choice: draftChoice(draft, current.choicePickerOpen, dispatch),
          // RFC #98: real account projection and link policy are not enabled yet.
          paymentSource: null,
          loanDates:
            draft.group === 'loan' || draft.group === 'investment'
              ? {
                  startDate: loanDate('startDate', draft.fields.startDate),
                }
              : null,
          cardDates:
            draft.group === 'credit-card'
              ? {
                  statementDate: cardDate('statementDate', draft.fields.statementDate),
                  dueDate: cardDate('dueDate', draft.fields.dueDate),
                }
              : null,
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
