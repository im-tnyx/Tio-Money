import { KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';

import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet, type BottomSheetLayer } from '@/shared/ui/app-bottom-sheet';
import { AppDateField } from '@/shared/ui/app-date-field';
import { AppText } from '@/shared/ui/app-text';

import {
  calendarDateParts,
  isCalendarDateField,
  type AddAccountScreenViewModel,
  type AddAccountViewModel,
  type DraftField,
} from './account-form-contract';
import {
  AccountField,
  AccountFormIcon,
  AccountFormRow,
  AmountCurrencyChoices,
  CalendarDateMonthAndYear,
  UnavailableAccountChoice,
} from './account-form-controls';
import { AccountGroupField, AccountGroupOptions } from './account-group-picker';
import { AccountDropdown } from './account-option-popup';
import { AccountPage } from './account-page';
import { BankModeEditor, BankPaymentModes } from './bank-payment-modes';

const fieldSpecs = {
  name: { label: 'accountName' },
  description: { label: 'accountDescription' },
  openingAmount: { label: 'accountOpeningAmount', money: true, currencyControl: true },
  outstanding: { label: 'accountCardOutstanding', money: true },
  creditLimit: { label: 'accountCardCreditLimit', money: true, currencyControl: true },
  statementDate: { label: 'accountCardStatementDate', date: true, monthly: true },
  dueDate: { label: 'accountCardDueDate', date: true, monthly: true },
  provider: { label: 'accountWalletProvider' },
  originalPrincipal: { label: 'accountLoanOriginalPrincipal', money: true },
  outstandingPrincipal: {
    label: 'accountLoanOutstandingPrincipal',
    money: true,
    currencyControl: true,
  },
  emiAmount: { label: 'accountLoanEmiAmount', money: true },
  startDate: { label: 'accountLoanStartDate', date: true },
  nextDueDate: { label: 'accountLoanNextDueDate', date: true },
  investedCost: { label: 'accountInvestmentCost', money: true, currencyControl: true },
  valuation: { label: 'accountInvestmentValuation', money: true },
  valuationDate: { label: 'accountInvestmentValuationDate', date: true },
} satisfies Record<
  DraftField,
  {
    label: TranslationKey;
    money?: boolean;
    date?: boolean;
    monthly?: boolean;
    currencyControl?: boolean;
  }
>;

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
  const spec = fieldSpecs[field];
  const money = 'money' in spec;
  const showCurrency = 'currencyControl' in spec && currencyChoices !== null;
  const date = 'date' in spec;
  const monthly = 'monthly' in spec;
  const calendar = isCalendarDateField(field);
  const parts = calendar ? calendarDateParts(value) : null;
  const fieldLabel = label ?? spec.label;
  const description = field === 'description';
  const icon = date ? 'calendar' : description ? 'description' : 'text';
  const leading = money ? (
    <AppText
      variant="title"
      numberOfLines={1}
      adjustsFontSizeToFit
      style={{ includeFontPadding: false }}
    >
      {currencySymbol}
    </AppText>
  ) : (
    <AccountFormIcon name={icon} />
  );
  return (
    <AccountField
      appearance="borderless"
      textSize={field === 'name' || money || date ? 'title' : 'section'}
      label={fieldLabel}
      accessibilityLabel={calendar ? t(fieldLabel) + ', ' + t('accountDateDay') : t(fieldLabel)}
      labelAsPlaceholder={field === 'name' || description}
      leading={leading}
      trailing={
        showCurrency ? (
          <AmountCurrencyChoices
            fieldLabel={fieldLabel}
            options={currencyChoices}
            value={currency}
            onChange={(value) => onAction({ type: 'currency', value })}
          />
        ) : undefined
      }
      value={parts?.day ?? value}
      keyboardType={date ? 'number-pad' : money ? 'decimal-pad' : undefined}
      maxLength={date ? 2 : undefined}
      suffix={
        monthly ? (
          <AppText style={{ includeFontPadding: false }}>{t('accountCardMonthlySuffix')}</AppText>
        ) : calendar && parts ? (
          <CalendarDateMonthAndYear
            label={fieldLabel}
            month={parts.month}
            year={parts.year}
            onMonthChange={(value) => onAction({ type: 'date.part', field, part: 'month', value })}
            onYearChange={(value) => onAction({ type: 'date.part', field, part: 'year', value })}
          />
        ) : undefined
      }
      placeholder={calendar ? t('accountDateDayPlaceholder') : money ? '0' : undefined}
      textAlign="left"
      multiline={description}
      returnKeyType={description ? 'done' : undefined}
      submitBehavior={description ? 'blurAndSubmit' : undefined}
      onChangeText={(value) =>
        onAction(
          calendar
            ? { type: 'date.part', field, part: 'day', value }
            : { type: 'text', field, value },
        )
      }
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
          contentContainerStyle={{ padding: theme.space.md, gap: theme.space.sm }}
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
  choice,
  loanDates,
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
      {choice ? (
        <AccountDropdown choice={choice} leading={<AccountFormIcon name="options" />} />
      ) : null}
      <GroupFields
        draft={draft}
        showWalletFunding={showWalletFunding}
        loanDates={loanDates}
        {...inputProps}
      />
      <DraftInput field="description" value={draft.fields.description} {...inputProps} />
      {draft.group === 'credit-card' || draft.group === 'loan' ? (
        <AccountFormRow label="accountAutoPay" leading={<AccountFormIcon name="autoPay" />}>
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
        </AccountFormRow>
      ) : null}
      {draft.group === 'bank' ? (
        <BankPaymentModes draft={draft} canAddMode={canAddMode} onAction={onAction} />
      ) : null}
    </>
  );
}

function PaymentFromField() {
  return (
    <AccountField
      label="accountPayFromCaption"
      appearance="borderless"
      textSize="title"
      leading={<AccountFormIcon name="card" />}
      placeholder={t('accountPayFromPlaceholder')}
      accessibilityLabel={t('accountPayFrom')}
      accessibilityState={{ disabled: true }}
      editable={false}
      value=""
      textAlign="left"
    />
  );
}

function GroupFields({
  draft,
  currencySymbol,
  currencyChoices,
  showWalletFunding,
  loanDates,
  onAction,
}: Pick<
  AddAccountViewModel,
  | 'draft'
  | 'currencySymbol'
  | 'currencyChoices'
  | 'showWalletFunding'
  | 'loanDates'
  | 'onAction'
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
          <PaymentFromField />
          <DraftInput field="statementDate" value={draft.fields.statementDate} {...inputProps} />
          <DraftInput field="dueDate" value={draft.fields.dueDate} {...inputProps} />
        </>
      );
    case 'wallet':
      return (
        <>
          <DraftInput field="provider" value={draft.fields.provider} {...inputProps} />
          {showWalletFunding ? (
            <DraftInput field="openingAmount" value={draft.fields.openingAmount} {...inputProps} />
          ) : (
            <UnavailableAccountChoice
              label="accountWalletBank"
              leading={<AccountFormIcon name="bank" />}
              detail="accountWalletBankUnavailable"
            />
          )}
        </>
      );
    case 'loan':
      return (
        <>
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
          <DraftInput field="emiAmount" value={draft.fields.emiAmount} {...inputProps} />
          <PaymentFromField />
          {loanDates ? (
            <>
              <AppDateField
                label={t('accountLoanStartDate')}
                leading={<AccountFormIcon name="calendar" />}
                {...loanDates.startDate}
              />
              <AppDateField
                label={t('accountLoanNextDueDate')}
                leading={<AccountFormIcon name="calendar" />}
                {...loanDates.nextDueDate}
              />
            </>
          ) : null}
        </>
      );
    case 'investment':
      return (
        <>
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
