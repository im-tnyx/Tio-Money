import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppText } from '@/shared/ui/app-text';

import {
  investmentKinds,
  loanDirections,
  walletKinds,
  type AccountFormAction,
  type AddAccountViewModel,
  type DraftField,
  type PreviewGroup,
} from './account-form-contract';
import { AccountChoices, AccountField, UnavailableAccountChoice } from './account-form-controls';
import { AccountPage } from './account-page';
import { BankModeEditor, BankPaymentModes } from './bank-payment-modes';

const titleKeys: Record<PreviewGroup, TranslationKey> = {
  cash: 'addCashAccount',
  bank: 'addBankAccount',
  'credit-card': 'addCardAccount',
  wallet: 'addWalletAccount',
  loan: 'addLoanAccount',
  investment: 'addInvestmentAccount',
};

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
const autoPayLabels = [
  'accountTrackingOff',
  'accountTrackingFull',
  'accountTrackingMinimum',
  'accountTrackingFixed',
] as const;

const fieldSpecs = {
  name: { label: 'accountName' },
  description: { label: 'accountDescription', multiline: true },
  openingAmount: { label: 'accountOpeningAmount', money: true },
  bankName: { label: 'accountBankName' },
  outstanding: { label: 'accountCardOutstanding', money: true },
  creditLimit: { label: 'accountCardCreditLimit', money: true },
  statementDate: { label: 'accountCardStatementDate', date: true },
  dueDate: { label: 'accountCardDueDate', date: true },
  provider: { label: 'accountWalletProvider' },
  originalPrincipal: { label: 'accountLoanOriginalPrincipal', money: true },
  outstandingPrincipal: { label: 'accountLoanOutstandingPrincipal', money: true },
  startDate: { label: 'accountLoanStartDate', date: true },
  nextDueDate: { label: 'accountLoanNextDueDate', date: true },
  investedCost: { label: 'accountInvestmentCost', money: true },
  valuation: { label: 'accountInvestmentValuation', money: true },
  valuationDate: { label: 'accountInvestmentValuationDate', date: true },
} satisfies Record<
  DraftField,
  { label: TranslationKey; money?: boolean; date?: boolean; multiline?: boolean }
>;

function DraftInput({
  field,
  value,
  onAction,
  currencySymbol,
  label,
}: {
  readonly field: DraftField;
  readonly value: string;
  readonly onAction: (action: AccountFormAction) => void;
  readonly currencySymbol: string;
  readonly label?: TranslationKey;
}) {
  const theme = useAppTheme();
  const spec = fieldSpecs[field];
  const money = 'money' in spec;
  const date = 'date' in spec;
  const leading = money ? (
    <AppText variant="section" numberOfLines={1} adjustsFontSizeToFit>
      {currencySymbol}
    </AppText>
  ) : (
    <Svg width={theme.iconRoles.textField} height={theme.iconRoles.textField} viewBox="0 0 24 24">
      <Path
        d={
          date
            ? 'M4 6h16v14H4z M4 10h16 M8 4v4 M16 4v4 M8 14h1 M12 14h1 M16 14h1'
            : 'M5 17 12 4l7 13 M8 12h8 M5 21h14'
        }
        fill="none"
        stroke={theme.colors.secondaryText}
        strokeWidth={theme.icons.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
  return (
    <AccountField
      appearance="borderless"
      label={label ?? spec.label}
      labelAsPlaceholder={field === 'name'}
      leading={leading}
      value={value}
      keyboardType={money ? 'decimal-pad' : undefined}
      placeholder={date ? t('accountReferenceDatePlaceholder') : money ? '0' : undefined}
      multiline={'multiline' in spec}
      onChangeText={(next) => onAction({ type: 'text', field, value: next })}
    />
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

  return (
    <AccountPage
      title={t(form ? titleKeys[form.draft.group] : 'addAccount')}
      backLabel={t('backToAccounts')}
      onBack={onBack}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}
        >
          {form ? (
            <AccountFields {...form} onBack={onBack} />
          ) : (
            <AppText>{t('accountGroupUnavailable')}</AppText>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      {form?.draft.group === 'bank' ? <BankModeEditor {...form} draft={form.draft} /> : null}
    </AccountPage>
  );
}

function AccountFields({
  draft,
  currencySymbol,
  currencyChoices,
  showWalletFunding,
  onAction,
  onBack,
}: AddAccountViewModel & { readonly onBack: () => void }) {
  const theme = useAppTheme();
  const inputProps = { currencySymbol, onAction };
  return (
    <>
      <AppText muted>{t('accountFormPreview')}</AppText>
      <DraftInput
        field="name"
        label={draft.group === 'credit-card' ? 'accountCardName' : undefined}
        value={draft.fields.name}
        {...inputProps}
      />
      <GroupFields draft={draft} showWalletFunding={showWalletFunding} {...inputProps} />
      {currencyChoices ? (
        <View style={{ gap: theme.space.xxs }}>
          <AccountChoices
            label="currency"
            options={currencyChoices}
            singleRow
            value={draft.currency}
            onChange={(value) => onAction({ type: 'currency', value })}
          />
          <AppText variant="caption" muted>
            {t('accountCurrencyChangeHint')}
          </AppText>
        </View>
      ) : null}
      <DraftInput field="description" value={draft.fields.description} {...inputProps} />
      {draft.group === 'bank' ? <BankPaymentModes draft={draft} onAction={onAction} /> : null}
      <View style={{ gap: theme.space.xxs }}>
        <AppText muted>{t('accountSaveUnavailable')}</AppText>
        <ActionButton label={t('save')} disabled />
        <ActionButton label={t('accountCancel')} variant="ghost" onPress={onBack} />
      </View>
    </>
  );
}

function GroupFields({
  draft,
  currencySymbol,
  showWalletFunding,
  onAction,
}: Pick<AddAccountViewModel, 'draft' | 'currencySymbol' | 'showWalletFunding' | 'onAction'>) {
  const inputProps = { currencySymbol, onAction };
  switch (draft.group) {
    case 'cash':
      return (
        <DraftInput field="openingAmount" value={draft.fields.openingAmount} {...inputProps} />
      );
    case 'bank':
      return (
        <>
          <DraftInput field="bankName" value={draft.fields.bankName} {...inputProps} />
          <DraftInput field="openingAmount" value={draft.fields.openingAmount} {...inputProps} />
        </>
      );
    case 'credit-card':
      return (
        <>
          <DraftInput field="outstanding" value={draft.fields.outstanding} {...inputProps} />
          <DraftInput field="creditLimit" value={draft.fields.creditLimit} {...inputProps} />
          <DraftInput field="statementDate" value={draft.fields.statementDate} {...inputProps} />
          <DraftInput field="dueDate" value={draft.fields.dueDate} {...inputProps} />
          <UnavailableAccountChoice label="accountPayFrom" detail="accountPayFromUnavailable" />
          <AccountChoices
            label="accountAutoPay"
            options={autoPayLabels.map((value) => ({ value, label: t(value) }))}
          />
          <AppText variant="caption" muted>
            {t('accountAutoPayUnavailable')}
          </AppText>
        </>
      );
    case 'wallet':
      return (
        <>
          <AccountChoices
            label="accountWalletKind"
            options={walletKinds.map((value) => ({ value, label: t(walletLabels[value]) }))}
            value={draft.walletKind}
            onChange={(value) => onAction({ type: 'wallet.kind', value })}
          />
          <DraftInput field="provider" value={draft.fields.provider} {...inputProps} />
          {showWalletFunding ? (
            <DraftInput field="openingAmount" value={draft.fields.openingAmount} {...inputProps} />
          ) : (
            <UnavailableAccountChoice
              label="accountWalletBank"
              detail="accountWalletBankUnavailable"
            />
          )}
        </>
      );
    case 'loan':
      return (
        <>
          <AccountChoices
            label="accountLoanDirection"
            options={loanDirections.map((value) => ({ value, label: t(loanLabels[value]) }))}
            value={draft.direction}
            onChange={(value) => onAction({ type: 'loan.direction', value })}
          />
          <DraftInput
            field="originalPrincipal"
            value={draft.fields.originalPrincipal}
            {...inputProps}
          />
          <DraftInput
            field="outstandingPrincipal"
            value={draft.fields.outstandingPrincipal}
            {...inputProps}
          />
          <DraftInput field="startDate" value={draft.fields.startDate} {...inputProps} />
          <DraftInput field="nextDueDate" value={draft.fields.nextDueDate} {...inputProps} />
        </>
      );
    case 'investment':
      return (
        <>
          <AccountChoices
            label="accountInvestmentType"
            options={investmentKinds.map((value) => ({ value, label: t(investmentLabels[value]) }))}
            value={draft.investmentKind}
            onChange={(value) => onAction({ type: 'investment.kind', value })}
          />
          <DraftInput field="investedCost" value={draft.fields.investedCost} {...inputProps} />
          <DraftInput field="valuation" value={draft.fields.valuation} {...inputProps} />
          <DraftInput field="valuationDate" value={draft.fields.valuationDate} {...inputProps} />
          <AppText variant="caption" muted>
            {t('accountInvestmentValuationHint')}
          </AppText>
        </>
      );
  }
}
