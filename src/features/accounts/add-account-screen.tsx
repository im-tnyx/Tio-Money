import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from 'react-native';

import type { CurrencyCode } from '@/shared/currency/currency-preference';
import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { AppTextField, type AppTextFieldProps } from '@/shared/ui/app-text-field';

import {
  bankCapabilities,
  type AccountDraft,
  type AccountFormAction,
} from './account-form-contract';
import { AccountPage } from './account-page';

interface AddAccountViewModel {
  readonly draft: AccountDraft;
  readonly currencies: readonly CurrencyCode[];
  readonly onAction: (action: AccountFormAction) => void;
}

const capabilityLabels = {
  upi: 'accountCapabilityUpi',
  debitCard: 'accountCapabilityDebitCard',
  cheque: 'accountCapabilityCheque',
  internetBanking: 'accountCapabilityInternetBanking',
} as const;

function Field({ label, ...props }: AppTextFieldProps & { readonly label: TranslationKey }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.xxs }}>
      <AppText>{t(label)}</AppText>
      <AppTextField accessibilityLabel={t(label)} {...props} />
    </View>
  );
}

export function AddAccountScreen({
  form,
  onBack,
}: {
  readonly form: AddAccountViewModel | null;
  readonly onBack: () => void;
}) {
  const theme = useAppTheme();
  const title =
    form?.draft.group === 'cash'
      ? 'addCashAccount'
      : form?.draft.group === 'bank'
        ? 'addBankAccount'
        : 'addAccount';

  return (
    <AccountPage title={t(title)} backLabel={t('backToAccounts')} onBack={onBack}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}
        >
          {form ? <AccountFields {...form} /> : <AppText>{t('accountGroupUnavailable')}</AppText>}
        </ScrollView>
      </KeyboardAvoidingView>
    </AccountPage>
  );
}

function AccountFields({ draft, currencies, onAction }: AddAccountViewModel) {
  const theme = useAppTheme();
  return (
    <>
      <AppText muted>{t('accountFormPreview')}</AppText>
      <Field
        label="accountName"
        value={draft.name}
        onChangeText={(value) => onAction({ type: 'text', field: 'name', value })}
      />
      {draft.group === 'bank' ? (
        <Field
          label="accountBankName"
          value={draft.bankName}
          onChangeText={(value) => onAction({ type: 'text', field: 'bankName', value })}
        />
      ) : null}
      <Field
        label="accountOpeningAmount"
        keyboardType="decimal-pad"
        value={draft.openingAmount}
        onChangeText={(value) => onAction({ type: 'text', field: 'openingAmount', value })}
      />
      <View style={{ gap: theme.space.xxs }}>
        <AppText>{t('currency')}</AppText>
        <View
          accessibilityRole="radiogroup"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}
        >
          {currencies.map((code) => (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: draft.currency === code }}
              onPress={() => onAction({ type: 'currency', value: code })}
              style={{
                minHeight: theme.buttons.minimumHeight,
                borderWidth: theme.buttons.outlineWidth,
                borderColor: draft.currency === code ? theme.colors.brand : theme.colors.border,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.card,
                paddingHorizontal: theme.space.md,
                justifyContent: 'center',
              }}
            >
              <AppText>{code}</AppText>
            </Pressable>
          ))}
        </View>
      </View>
      {draft.group === 'bank' ? (
        <View style={{ gap: theme.space.xxs }}>
          <AppText variant="section">{t('accountPaymentCapabilities')}</AppText>
          {bankCapabilities.map((capability) => (
            <View
              key={capability}
              style={{
                minHeight: theme.buttons.minimumHeight,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.md,
              }}
            >
              <AppText style={{ flex: 1 }}>{t(capabilityLabels[capability])}</AppText>
              <Switch
                accessibilityLabel={t(capabilityLabels[capability])}
                value={draft.capabilities[capability]}
                onValueChange={(value) => onAction({ type: 'capability', capability, value })}
                trackColor={{ true: theme.colors.brand }}
              />
            </View>
          ))}
        </View>
      ) : null}
      <Field
        label="accountDescription"
        multiline
        value={draft.description}
        onChangeText={(value) => onAction({ type: 'text', field: 'description', value })}
      />
    </>
  );
}
