import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { useCurrencySettings } from '@/shared/currency/currency-provider';

import {
  draftCurrencies,
  isPreviewGroup,
  newAccountDraft,
  updateAccountDraft,
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
  const currencies = draftCurrencies(preferences);
  const [edit, setEdit] = useState(() => newAccountDraft(group, preferences.mainCode));
  const draft = currencies.includes(edit.currency)
    ? edit
    : updateAccountDraft(edit, { type: 'currency', value: preferences.mainCode }, currencies);
  return (
    <AddAccountScreen
      form={{
        draft,
        currencies,
        onAction: (action) => setEdit(updateAccountDraft(draft, action, currencies)),
      }}
      onBack={onBack}
    />
  );
}
