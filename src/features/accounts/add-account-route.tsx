import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { CURRENCY_OPTIONS } from '@/shared/currency/currency-preference';
import { useCurrencySettings } from '@/shared/currency/currency-provider';
import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';

import {
  accountCurrencyChoices,
  draftCurrencies,
  isPreviewGroup,
  newAccountDraft,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountDraft,
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
  const { preferences } = useCurrencySettings();
  const reduceMotion = useReducedMotion();
  const currencies = draftCurrencies(preferences);
  const [edit, setEdit] = useState(() => newAccountDraft(group, preferences.mainCode));

  function withConfiguredCurrency(previous: AccountDraft) {
    return reconcileAccountDraftCurrency(previous, preferences.mainCode, currencies);
  }

  const draft = withConfiguredCurrency(edit);
  // Keep the reconciled draft so re-adding a removed currency cannot revive old amounts.
  if (draft !== edit) setEdit(draft);

  return (
    <AddAccountScreen
      form={{
        draft,
        currencySymbol:
          CURRENCY_OPTIONS.find(({ code }) => code === draft.currency)?.symbol ?? draft.currency,
        currencyChoices:
          accountCurrencyChoices(draft, currencies)?.map((value) => ({
            value,
            label: value,
            symbol: CURRENCY_OPTIONS.find(({ code }) => code === value)?.symbol,
          })) ?? null,
        showWalletFunding: draft.group === 'wallet' && draft.walletKind === 'funded',
        canApplyMode: draft.group === 'bank' && Boolean(draft.modeEditor?.name.trim()),
        animateSheet: !reduceMotion,
        onAction: (action) =>
          setEdit((previous) =>
            updateAccountDraft(withConfiguredCurrency(previous), action, currencies),
          ),
      }}
      onBack={onBack}
    />
  );
}
