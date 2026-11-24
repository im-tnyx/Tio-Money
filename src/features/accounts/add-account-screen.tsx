import { KeyboardAvoidingView, Platform, ScrollView, Switch, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet, type BottomSheetLayer } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import {
  investmentKinds,
  loanDirections,
  walletKinds,
  type AddAccountScreenViewModel,
  type AddAccountViewModel,
  type DraftField,
} from './account-form-contract';
import {
  AccountChoices,
  AccountField,
  AmountCurrencyChoices,
  UnavailableAccountChoice,
} from './account-form-controls';
import { AccountGroupField, AccountGroupOptions } from './account-group-picker';
import { AccountPage } from './account-page';
import { BankModeEditor, BankPaymentModes } from './bank-payment-modes';

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
const fieldSpecs = {
  name: { label: 'accountName' },
  description: { label: 'accountDescription' },
  openingAmount: { label: 'accountOpeningAmount', money: true, currencyControl: true },
  outstanding: { label: 'accountCardOutstanding', money: true },
  creditLimit: { label: 'accountCardCreditLimit', money: true, currencyControl: true },
  statementDate: { label: 'accountCardStatementDate', date: true },
  dueDate: { label: 'accountCardDueDate', date: true },
  provider: { label: 'accountWalletProvider' },
  originalPrincipal: { label: 'accountLoanOriginalPrincipal', money: true },
  outstandingPrincipal: {
    label: 'accountLoanOutstandingPrincipal',
    money: true,
    currencyControl: true,
  },
  startDate: { label: 'accountLoanStartDate', date: true },
  nextDueDate: { label: 'accountLoanNextDueDate', date: true },
  investedCost: { label: 'accountInvestmentCost', money: true, currencyControl: true },
  valuation: { label: 'accountInvestmentValuation', money: true },
  valuationDate: { label: 'accountInvestmentValuationDate', date: true },
} satisfies Record<
  DraftField,
  { label: TranslationKey; money?: boolean; date?: boolean; currencyControl?: boolean }
>;

const inputIcons = {
  text: 'M5 17 12 4l7 13 M8 12h8 M5 21h14',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 4v4 M16 4v4 M8 14h1 M12 14h1 M16 14h1',
  description: 'M4 6h16 M4 10h16 M4 14h16 M4 18h10',
} as const;

type DraftInputControls = Pick<
  AddAccountViewModel,
  'currencySymbol' | 'currencyChoices' | 'onAction'
> & {
  readonly currency: AddAccountViewModel['draft']['currency'];
};

function DraftInput({
  field,
  value,
  onAction,
  currencySymbol,
  currencyChoices,
  currency,
  label,
}: DraftInputControls & {
  readonly field: DraftField;
  readonly value: string;
  readonly label?: TranslationKey;
}) {
  const theme = useAppTheme();
  const spec = fieldSpecs[field];
  const money = 'money' in spec;
  const showCurrency = 'currencyControl' in spec && currencyChoices !== null;
  const date = 'date' in spec;
  const description = field === 'description';
  const icon = date ? 'calendar' : description ? 'description' : 'text';
  const leading = money ? (
    <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit>
      {currencySymbol}
    </AppText>
  ) : (
    <Svg width={theme.iconRoles.textField} height={theme.iconRoles.textField} viewBox="0 0 24 24">
      <Path
        d={inputIcons[icon]}
        fill="none"
        stroke={theme.colors.primaryText}
        strokeWidth={theme.icons.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
  return (
    <AccountField
      appearance="borderless"
      textSize={field === 'name' || money || date ? 'title' : 'section'}
      label={label ?? spec.label}
      labelAsPlaceholder={field === 'name' || description}
      leading={leading}
      trailing={
        showCurrency ? (
          <AmountCurrencyChoices
            fieldLabel={label ?? spec.label}
            options={currencyChoices}
            value={currency}
            onChange={(value) => onAction({ type: 'currency', value })}
          />
        ) : undefined
      }
      value={value}
      keyboardType={money ? 'decimal-pad' : undefined}
      placeholder={date ? t('accountReferenceDatePlaceholder') : money ? '0' : undefined}
      multiline={description}
      returnKeyType={description ? 'done' : undefined}
      submitBehavior={description ? 'blurAndSubmit' : undefined}
      onChangeText={(next) => onAction({ type: 'text', field, value: next })}
    />
  );
}

export function AddAccountScreen({
  form,
  groupLabel,
  groupChoices,
  animateSheet,
  onOpenGroupPicker,
  onCloseGroupPicker,
  onClose,
}: AddAccountScreenViewModel) {
  const theme = useAppTheme();
  let sheet: BottomSheetLayer | undefined;
  if (groupChoices) {
    sheet = {
      title: t('chooseAccountGroup'),
      dismissAccessibilityLabel: t('closeAccountGroupPicker'),
      onDismiss: onCloseGroupPicker,
      showCloseButton: true,
      children: <AccountGroupOptions choices={groupChoices} />,
    };
  } else if (form?.draft.group === 'bank' && form.draft.modeEditor) {
    sheet = {
      title: t(form.draft.modeEditor.id === null ? 'accountModeAdd' : 'accountModeEdit'),
      dismissAccessibilityLabel: t('closeAccountPaymentMode'),
      onDismiss: () => form.onAction({ type: 'mode.cancel' }),
      children: <BankModeEditor {...form} draft={form.draft} />,
    };
  }

  return (
    <AccountPage
      editing
      title={t('addAccount')}
      backLabel={t('closeAddAccount')}
      onBack={onClose}
      actions={[
        {
          key: 'save',
          icon: 'save',
          accessibilityLabel: t('save'),
          accessibilityHint: t('accountSaveUnavailable'),
          disabled: true,
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}
        >
          <AccountGroupField value={groupLabel} onPress={onOpenGroupPicker} />
          {form ? <AccountFields key={form.draft.group} {...form} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <AppBottomSheet
        visible={sheet !== undefined}
        animate={animateSheet}
        avoidKeyboard
        title={sheet?.title ?? t('chooseAccountGroup')}
        dismissAccessibilityLabel={sheet?.dismissAccessibilityLabel ?? t('closeAccountGroupPicker')}
        onDismiss={sheet?.onDismiss ?? onCloseGroupPicker}
        showCloseButton={sheet?.showCloseButton}
      >
        {sheet?.children}
      </AppBottomSheet>
    </AccountPage>
  );
}

function AccountFields({
  draft,
  currencySymbol,
  currencyChoices,
  showWalletFunding,
  canAddMode,
  onAction,
}: AddAccountViewModel) {
  const theme = useAppTheme();
  const inputProps = { currencySymbol, currencyChoices, currency: draft.currency, onAction };
  return (
    <>
      <DraftInput
        field="name"
        label={draft.group === 'credit-card' ? 'accountCardName' : undefined}
        value={draft.fields.name}
        {...inputProps}
      />
      <GroupFields draft={draft} showWalletFunding={showWalletFunding} {...inputProps} />
      <DraftInput field="description" value={draft.fields.description} {...inputProps} />
      {draft.group === 'credit-card' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.space.sm,
          }}
        >
          <AppText>{t('accountAutoPay')}</AppText>
          <Switch
            accessibilityRole="switch"
            accessibilityLabel={t('accountAutoPay')}
            accessibilityHint={t('accountAutoPayUnavailable')}
            accessibilityState={{ disabled: true, checked: false }}
            trackColor={{ false: theme.colors.border }}
            ios_backgroundColor={theme.colors.border}
            value={false}
            disabled
          />
        </View>
      ) : null}
      {draft.group === 'bank' ? (
        <BankPaymentModes draft={draft} canAddMode={canAddMode} onAction={onAction} />
      ) : null}
    </>
  );
}

function GroupFields({
  draft,
  currencySymbol,
  currencyChoices,
  showWalletFunding,
  onAction,
}: Pick<
  AddAccountViewModel,
  'draft' | 'currencySymbol' | 'currencyChoices' | 'showWalletFunding' | 'onAction'
>) {
  const inputProps = { currencySymbol, currencyChoices, currency: draft.currency, onAction };
  switch (draft.group) {
    case 'cash':
    case 'bank':
      return (
        <DraftInput field="openingAmount" value={draft.fields.openingAmount} {...inputProps} />
      );
    case 'credit-card':
      return (
        <>
          <DraftInput field="outstanding" value={draft.fields.outstanding} {...inputProps} />
          <DraftInput field="creditLimit" value={draft.fields.creditLimit} {...inputProps} />
          <DraftInput field="statementDate" value={draft.fields.statementDate} {...inputProps} />
          <DraftInput field="dueDate" value={draft.fields.dueDate} {...inputProps} />
          <UnavailableAccountChoice label="accountPayFrom" detail="accountPayFromUnavailable" />
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
