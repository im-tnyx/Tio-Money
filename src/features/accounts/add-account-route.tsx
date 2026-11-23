import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

import { CURRENCY_OPTIONS, MAX_SUB_CURRENCIES } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { formatSubCurrencyDetailCaption } from '@/shared/currency/sub-currency-detail-preview';
import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';

import {
  accountCurrencyChoices,
  draftCurrencies,
  isPreviewGroup,
  newAccountDraft,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountDraft,
  type AccountFormAction,
  type PreviewGroup,
} from './account-form-contract';
import { AddAccountScreen } from './add-account-screen';

export function AddAccountRoute() {
  const { group } = useLocalSearchParams();
  const router = useRouter();
  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/accounts');
  };

  if (!isPreviewGroup(group)) return <AddAccountScreen form={null} onBack={onBack} />;
  return <AccountDraftController key={group} group={group} onBack={onBack} />;
}

function AccountDraftController({
  group,
  onBack,
}: {
  readonly group: PreviewGroup;
  readonly onBack: () => void;
}) {
  const router = useRouter();
  const { preferences } = useCurrencySettings();
  const reduceMotion = useReducedMotion();
  const currencies = draftCurrencies(preferences);
  const [edit, setEdit] = useState(() => newAccountDraft(group, preferences.mainCode));
  const [pickerVisible, setPickerVisible] = useState(false);
  const addCurrencyPending = useRef(false);

  const openAddCurrency = useCallback(() => {
    if (!addCurrencyPending.current) return;
    addCurrencyPending.current = false;
    router.push({ pathname: '/currency/sub', params: { add: '1' } });
  }, [router]);

  // Android Modal has no dismissal callback. Commit the hidden picker first.
  useEffect(() => {
    if (pickerVisible || Platform.OS === 'ios' || !addCurrencyPending.current) return;
    const frame = requestAnimationFrame(openAddCurrency);
    return () => cancelAnimationFrame(frame);
  }, [openAddCurrency, pickerVisible]);

  function withConfiguredCurrency(previous: AccountDraft) {
    return reconcileAccountDraftCurrency(previous, preferences.mainCode, currencies);
  }

  const draft = withConfiguredCurrency(edit);
  // Keep the reconciled draft so re-adding a removed currency cannot revive old amounts.
  if (draft !== edit) setEdit(draft);
  const currencyChoices = accountCurrencyChoices(draft, currencies);
  if (pickerVisible && !currencyChoices) setPickerVisible(false);

  function onAction(action: AccountFormAction) {
    setEdit((previous) => updateAccountDraft(withConfiguredCurrency(previous), action, currencies));
  }

  return (
    <AddAccountScreen
      form={{
        draft,
        currencySymbol:
          CURRENCY_OPTIONS.find(({ code }) => code === draft.currency)?.symbol ?? draft.currency,
        currencyPicker: currencyChoices
          ? {
              options: currencyChoices.map((value) => ({
                value,
                label: formatSubCurrencyDetailCaption(value),
              })),
              visible: pickerVisible,
              onOpen: () => {
                if (addCurrencyPending.current) return;
                Keyboard.dismiss();
                setPickerVisible(true);
              },
              onClose: () => setPickerVisible(false),
              onSelect: (value) => {
                if (addCurrencyPending.current) return;
                onAction({ type: 'currency', value });
                setPickerVisible(false);
              },
              onAddCurrency:
                preferences.subCodes.length < MAX_SUB_CURRENCIES
                  ? () => {
                      addCurrencyPending.current = true;
                      setPickerVisible(false);
                    }
                  : null,
              onDismissed: openAddCurrency,
            }
          : null,
        showWalletFunding: draft.group === 'wallet' && draft.walletKind === 'funded',
        canApplyMode: draft.group === 'bank' && Boolean(draft.modeEditor?.name.trim()),
        animateSheet: !reduceMotion,
        onAction,
      }}
      onBack={onBack}
    />
  );
}
