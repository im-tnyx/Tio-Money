import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  newAccountAddSession,
  presentInitialAccountGroupPicker,
  reconcileAccountAddCurrencies,
  updateAccountAddSession,
  type AccountAddAction,
  type AccountAddSession,
} from '../../src/features/accounts/account-add-session';
import {
  accountCurrencyChoices,
  draftCurrencies,
  isPreviewGroup,
  newAccountDraft,
  paymentModeAvailability,
  paymentModeTypes,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountDraft,
  type AccountFormAction,
  type DraftField,
  type PreviewGroup,
} from '../../src/features/accounts/account-form-contract';
import {
  accountPickerGroups,
  accountPickerVisible,
  selectedAccountName,
  type AccountPickerModel,
} from '../../src/features/accounts/account-picker-contract';
import { accountPopupPosition } from '../../src/features/accounts/account-popup-position';
import { fitPopupRows, popupPosition } from '../../src/shared/ui/popup-position';
import { focusedFieldScrollOffset } from '../../src/shared/ui/keyboard-form-geometry';
import { BUILT_IN_ACCOUNT_GROUPS } from '../../src/features/settings/account-group-templates';
import paymentModeIcons from '../../src/shared/assets/google-material-icons/payment-mode-icons.json';
import saveIcon from '../../src/shared/assets/google-material-icons/save-icon.json';
import { en } from '../../src/shared/i18n/strings';
import { wheelProjection, wheelProjectionSamples } from '../../src/shared/ui/wheel-projection';
import { shouldAlignWheel, shouldAnimateWheelAlignment } from '../../src/shared/ui/wheel-selection';
import {
  calendarMonths,
  calendarWheelCounts,
  calendarWheelIndex,
  calendarWheelLabel,
  dayWheelBounds,
  dayWheelCount,
  initialDayWheelIndex,
  initialMonthWheelIndex,
  localCalendarToday,
  monthWheelBounds,
  monthWheelCount,
  nextDayWheelIndex,
  nextMonthWheelIndex,
  parseCalendarDate,
  selectCalendarWheel,
} from '../../src/shared/ui/calendar-date';
import {
  buttonTokens,
  datePickerTokens,
  navigationTokens,
  segmentedControlTokens,
  textFieldTokens,
  wheelPickerTokens,
} from '../../src/shared/theme/component-tokens';
import { space } from '../../src/shared/theme/tokens';
import {
  initialMonthDayWheelIndex,
  monthDayFromWheelIndex,
  monthDayWheelCount,
} from '../../src/shared/ui/month-day';

const currencies = draftCurrencies({ mainCode: 'INR', subCodes: ['USD', 'JPY'] });

function replay(group: PreviewGroup, actions: readonly AccountFormAction[]) {
  return actions.reduce(
    (draft, action) => updateAccountDraft(draft, action, currencies),
    newAccountDraft(group, 'INR'),
  );
}

test('six built-in groups open a form; unknown IDs do not', () => {
  assert.deepEqual(
    BUILT_IN_ACCOUNT_GROUPS.map(({ id }) => id),
    ['cash', 'bank', 'credit-card', 'loan', 'investment', 'wallet'],
  );
  assert.ok(BUILT_IN_ACCOUNT_GROUPS.every(({ id }) => isPreviewGroup(id)));
  for (const invalid of ['insurance', 'custom', ['cash'], {}, undefined]) {
    assert.equal(isPreviewGroup(invalid), false);
  }
});

function updateSession(session: AccountAddSession, action: AccountAddAction) {
  return updateAccountAddSession(session, action, 'INR', currencies);
}

test('the first Group picker waits for entry and late transition events do not reopen it', () => {
  const opening = newAccountAddSession();
  assert.equal(opening.groupPicker, 'pending');
  assert.equal(opening.group, null);
  assert.deepEqual(opening.drafts, {});
  assert.equal(updateSession(opening, { type: 'group.select', group: 'cash' }), opening);
  const picker = presentInitialAccountGroupPicker(opening);
  assert.equal(picker.groupPicker, 'open');
  assert.equal(newAccountAddSession(true).groupPicker, 'open');
  const dismissed = updateSession(picker, { type: 'group.close' });
  assert.equal(dismissed.group, null);
  assert.equal(presentInitialAccountGroupPicker(dismissed), dismissed);
  for (const { id: group } of BUILT_IN_ACCOUNT_GROUPS) {
    if (!isPreviewGroup(group)) continue;
    const form = updateSession(picker, { type: 'group.select', group });
    assert.deepEqual(form, {
      groupPicker: 'closed',
      choicePickerOpen: false,
      datePicker: null,
      datePickerEpoch: 0,
      group,
      drafts: { [group]: newAccountDraft(group, 'INR') },
    });
    assert.equal(updateSession(form, { type: 'group.select', group: 'cash' }), form);
    assert.equal(presentInitialAccountGroupPicker(form), form);
  }
});

test('changing and dismissing Group retains separate drafts and guards inactive currencies', () => {
  const actions: readonly AccountAddAction[] = [
    { type: 'group.select', group: 'bank' },
    { type: 'form', group: 'bank', action: { type: 'text', field: 'name', value: 'Travel' } },
    { type: 'form', group: 'bank', action: { type: 'currency', value: 'USD' } },
    { type: 'form', group: 'bank', action: { type: 'text', field: 'openingAmount', value: '25' } },
    { type: 'group.open' },
    { type: 'group.close' },
    { type: 'group.open' },
    { type: 'group.select', group: 'credit-card' },
    { type: 'form', group: 'bank', action: { type: 'text', field: 'name', value: 'Stale' } },
    {
      type: 'form',
      group: 'credit-card',
      action: { type: 'text', field: 'creditLimit', value: '50' },
    },
  ];
  const card = actions.reduce(updateSession, newAccountAddSession(true));
  assert.equal(card.group, 'credit-card');
  assert.equal(card.drafts.bank?.fields.name, 'Travel');
  assert.equal(card.drafts.bank?.currency, 'USD');
  const reconciled = reconcileAccountAddCurrencies(card, 'INR', ['INR']);
  const readded = reconcileAccountAddCurrencies(reconciled, 'INR', currencies);
  const bank = updateSession(updateSession(readded, { type: 'group.open' }), {
    type: 'group.select',
    group: 'bank',
  });
  assert.equal(bank.group, 'bank');
  assert.equal(bank.drafts.bank?.currency, 'INR');
  assert.deepEqual(bank.drafts.bank?.fields, {
    name: 'Travel',
    description: '',
    openingAmount: '',
  });
  assert.equal(bank.drafts['credit-card'], card.drafts['credit-card']);
});

test('Loan Direction dropdown preserves drafts on dismiss and closes after one selection', () => {
  const choice = { type: 'loan.direction', value: 'given' } as const;
  const initial = newAccountAddSession(true);
  const bank = updateSession(initial, { type: 'group.select', group: 'bank' });
  assert.equal(updateSession(bank, { type: 'options.open' }), bank);
  const wallet = updateSession(initial, { type: 'group.select', group: 'wallet' });
  assert.equal(updateSession(wallet, { type: 'options.open' }), wallet);
  const investment = updateSession(initial, { type: 'group.select', group: 'investment' });
  assert.equal(updateSession(investment, { type: 'options.open' }), investment);

  const form = updateSession(initial, { type: 'group.select', group: 'loan' });
  const named = updateSession(form, {
    type: 'form',
    group: 'loan',
    action: { type: 'text', field: 'name', value: 'Keep this edit' },
  });
  const open = updateSession(named, { type: 'options.open' });
  assert.equal(open.choicePickerOpen, true);
  assert.equal(updateSession(open, { type: 'group.open' }), open);

  const dismissed = updateSession(open, { type: 'options.close' });
  assert.equal(dismissed.choicePickerOpen, false);
  assert.equal(dismissed.drafts, named.drafts);
  assert.equal(updateSession(dismissed, { type: 'options.select', choice }), dismissed);
  const selected = updateSession(open, { type: 'options.select', choice });
  assert.equal(selected.choicePickerOpen, false);
  assert.equal(updateSession(selected, { type: 'options.select', choice }), selected);

  const backToGroupPicker = updateSession(selected, { type: 'group.open' });
  const cash = updateSession(backToGroupPicker, { type: 'group.select', group: 'cash' });
  const reopened = updateSession(updateSession(cash, { type: 'group.open' }), {
    type: 'group.select',
    group: 'loan',
  });
  const draft = reopened.drafts.loan;
  assert.ok(draft?.group === 'loan');
  assert.equal(draft.direction, 'given');
  assert.equal(draft.fields.name, 'Keep this edit');
});

test('closing the Bank payment editor discards unapplied changes and preserves the form', () => {
  const actions: readonly AccountAddAction[] = [
    { type: 'group.select', group: 'bank' },
    { type: 'form', group: 'bank', action: { type: 'text', field: 'name', value: 'Everyday' } },
    { type: 'form', group: 'bank', action: { type: 'mode.open' } },
    { type: 'form', group: 'bank', action: { type: 'mode.name', value: 'Unapplied' } },
  ];
  const editing = actions.reduce(updateSession, newAccountAddSession(true));
  assert.equal(updateSession(editing, { type: 'group.open' }), editing);
  const bank = updateSession(editing, {
    type: 'form',
    group: 'bank',
    action: { type: 'mode.cancel' },
  });
  const draft = bank.drafts.bank;
  assert.equal(bank.group, 'bank');
  if (draft?.group !== 'bank') assert.fail();
  assert.equal(draft.fields.name, 'Everyday');
  assert.equal(draft.modeEditor, null);
  assert.deepEqual(draft.modes, []);
});

test('batched Wallet text edits preserve independent balance details', () => {
  const draft = replay('wallet', [
    { type: 'text', field: 'name', value: 'Weekend' },
    { type: 'text', field: 'openingAmount', value: '123.45' },
    { type: 'text', field: 'description', value: 'Cash reserve' },
  ]);
  assert.equal(draft.group, 'wallet');
  assert.deepEqual(draft.fields, {
    name: 'Weekend',
    openingAmount: '123.45',
    description: 'Cash reserve',
  });
  assert.equal(newAccountDraft('wallet', 'INR').fields.name, '');
  const route = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  assert.match(route, /setSession\(\(previous\) =>/);
  assert.doesNotMatch(route, /walletKind|showWalletFunding/);
});

test('Bank mode drafts add, edit, cancel and remove using the newest actions and stable row IDs', () => {
  const bank = replay('bank', [
    { type: 'text', field: 'name', value: 'Everyday account' },
    { type: 'mode.open' },
    { type: 'mode.name', value: '   ' },
    { type: 'mode.apply' },
    { type: 'mode.name', value: ' Everyday ' },
    { type: 'mode.kind', value: 'upi' },
    { type: 'mode.apply' },
    { type: 'mode.apply' },
    { type: 'mode.open' },
    { type: 'mode.name', value: 'Card' },
    { type: 'mode.apply' },
    { type: 'mode.open', id: 1 },
    { type: 'mode.name', value: 'Discard this' },
    { type: 'mode.kind', value: 'cheque' },
    { type: 'mode.cancel' },
  ]);
  assert.equal(bank.group, 'bank');
  if (bank.group !== 'bank') assert.fail();
  assert.deepEqual(bank.modes, [
    { id: 1, name: 'Everyday', kind: 'upi' },
    { id: 2, name: 'Card', kind: 'debitCard' },
  ]);
  const edits: readonly AccountFormAction[] = [
    { type: 'mode.open', id: 1 },
    { type: 'mode.name', value: 'Edited' },
    { type: 'mode.kind', value: 'internetBanking' },
    { type: 'mode.apply' },
    { type: 'mode.remove', id: 2 },
  ];
  const edited = edits.reduce<AccountDraft>(
    (draft, action) => updateAccountDraft(draft, action, currencies),
    bank,
  );
  if (edited.group !== 'bank') assert.fail();
  assert.equal(edited.fields.name, 'Everyday account');
  assert.deepEqual(edited.modes, [{ id: 1, name: 'Edited', kind: 'internetBanking' }]);
  assert.equal(edited.modeEditor, null);
  const cash = newAccountDraft('cash', 'INR');
  assert.equal(updateAccountDraft(cash, { type: 'mode.open' }, currencies), cash);
  assert.equal(
    updateAccountDraft(cash, { type: 'text', field: 'creditLimit', value: '123' }, currencies),
    cash,
  );
});

test('Bank mode limits block new slots and full destinations while preserving existing edits', () => {
  const kinds = [
    'debitCard',
    'debitCard',
    'debitCard',
    'upi',
    'upi',
    'upi',
    'cheque',
    'internetBanking',
  ] as const;
  const apply = (draft: AccountDraft, ...actions: AccountFormAction[]) =>
    actions.reduce((current, action) => updateAccountDraft(current, action, currencies), draft);
  const addActions = kinds.flatMap<AccountFormAction>((kind, index) => [
    { type: 'mode.open' },
    { type: 'mode.kind', value: kind },
    { type: 'mode.name', value: 'Mode ' + (index + 1) },
    { type: 'mode.apply' },
  ]);
  const debitCards = replay('bank', addActions.slice(0, 12));
  const next = apply(debitCards, { type: 'mode.open' }, { type: 'mode.kind', value: 'debitCard' });
  if (next.group !== 'bank') assert.fail();
  assert.equal(next.modeEditor?.kind, 'upi');
  assert.deepEqual(paymentModeAvailability(next).availableTypes, [
    'upi',
    'cheque',
    'internetBanking',
  ]);

  const full = replay('bank', addActions);
  if (full.group !== 'bank') assert.fail();
  assert.deepEqual(
    full.modes.map(({ kind }) => kind),
    kinds,
  );
  assert.equal(paymentModeAvailability(full).canAdd, false);
  assert.equal(apply(full, { type: 'mode.open' }), full);

  const editing = apply(
    full,
    { type: 'mode.open', id: 1 },
    { type: 'mode.name', value: 'Renamed card' },
    { type: 'mode.kind', value: 'upi' },
  );
  if (editing.group !== 'bank') assert.fail();
  assert.deepEqual(paymentModeAvailability(editing).availableTypes, ['debitCard']);
  assert.equal(paymentModeAvailability(editing).canApply, true);
  const renamed = apply(editing, { type: 'mode.apply' });
  if (renamed.group !== 'bank') assert.fail();
  assert.deepEqual(renamed.modes[0], { id: 1, name: 'Renamed card', kind: 'debitCard' });

  const freed = apply(renamed, { type: 'mode.remove', id: 4 });
  if (freed.group !== 'bank') assert.fail();
  assert.equal(paymentModeAvailability(freed).canAdd, true);
  const moved = apply(
    freed,
    { type: 'mode.open', id: 1 },
    { type: 'mode.kind', value: 'upi' },
    { type: 'mode.apply' },
  );
  if (moved.group !== 'bank') assert.fail();
  assert.deepEqual(moved.modes[0], { id: 1, name: 'Renamed card', kind: 'upi' });
  assert.deepEqual(paymentModeAvailability(moved).availableTypes, ['debitCard']);
});

test('linked payment modes show a compact header action and named icon rows with stable controls', () => {
  const source = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  const list = source.slice(
    source.indexOf('export function BankPaymentModes'),
    source.indexOf('export function BankModeEditor'),
  );
  assert.match(
    list,
    /draft.modes.length === 0 \? \(\s*<EmptyBankPaymentModes \/>\s*\) : \(\s*draft.modes.map/,
  );
  const empty = source.slice(
    source.indexOf('function EmptyBankPaymentModes'),
    source.indexOf('type BankModesProps'),
  );
  assert.match(
    empty,
    /<Svg[\s\S]*?accessibilityElementsHidden[\s\S]*?accountModeEmptyTitle[\s\S]*?accountModeEmptyDescription/,
  );
  assert.match(
    empty,
    /width=\{theme.icons.emptyStateSize\}\s+height=\{theme.icons.emptyStateSize\}/,
  );
  const rows = list.indexOf('draft.modes.map');
  assert.ok(rows >= 0);
  assert.match(
    list.slice(0, rows),
    /accessibilityRole="header"[\s\S]*?<ActionButton\s+compact\s+size="small"[\s\S]*?accountModeAdd[\s\S]*?type: 'mode\.open'/,
  );
  assert.match(
    list.slice(rows),
    /<ModeIcon name=\{mode.kind\}[\s\S]*?\{mode.name\}[\s\S]*?icon="edit"[\s\S]*?type: 'mode.open', id: mode.id[\s\S]*?icon="remove"[\s\S]*?type: 'mode.remove', id: mode.id/,
  );
  assert.match(list, /accessibilityLabel=\{mode.name \+ ', ' \+ t\(modeLabels\[mode.kind\]\)\}/);
  assert.match(list, /accessibilityLabel=\{t\('accountModeEdit'\) \+ ': ' \+ mode.name\}/);
  assert.match(list, /accessibilityLabel=\{t\('accountModeRemove'\) \+ ': ' \+ mode.name\}/);
  assert.match(list, /disabled=\{!canAddMode\}/);
  assert.match(list, /<View style=\{\{ flexDirection: 'row' \}\}>\s+<ModeRowAction/);
  assert.match(
    source,
    /width: theme.buttons.minimumHeight,\s+minHeight: theme.buttons.minimumHeight/,
  );
  assert.match(
    source,
    /width: theme.buttons.smallActionHeight,\s+height: theme.buttons.smallActionHeight/,
  );
  assert.match(
    source,
    /width=\{theme.buttons.smallActionIconSize\}\s+height=\{theme.buttons.smallActionIconSize\}/,
  );
  assert.match(source, /<SvgXml\s+xml=\{paymentModeIcons\[name\]\}/);
  assert.deepEqual(Object.keys(paymentModeIcons), [...paymentModeTypes]);
  for (const xml of Object.values(paymentModeIcons)) {
    assert.match(xml, /<svg[^>]+viewBox="0 -960 960 960"/);
  }
});

test('currency uses configured preferences, retains reference dates and never relabels amounts', () => {
  assert.deepEqual(currencies, ['INR', 'USD', 'JPY']);
  const draft = replay('investment', [
    { type: 'text', field: 'investedCost', value: '123.45' },
    { type: 'text', field: 'tenure', value: '12' },
  ]);
  assert.equal(updateAccountDraft(draft, { type: 'currency', value: 'EUR' }, currencies), draft);
  assert.equal(updateAccountDraft(draft, { type: 'currency', value: 'INR' }, currencies), draft);
  const changed = updateAccountDraft(draft, { type: 'currency', value: 'JPY' }, currencies);
  assert.equal(changed.currency, 'JPY');
  assert.ok(changed.group === 'investment');
  assert.deepEqual(changed.fields, { ...draft.fields, investedCost: '' });
  assert.equal(changed.fields.tenure, '12');
});

test('every eligible form defaults to Main and only shows currency choices with configured Subs', () => {
  const mainOnly = draftCurrencies({ mainCode: 'INR', subCodes: [] });
  for (const { id } of BUILT_IN_ACCOUNT_GROUPS) {
    if (!isPreviewGroup(id)) continue;
    const draft = newAccountDraft(id, 'INR');
    assert.equal(draft.currency, 'INR', id);
    assert.equal(accountCurrencyChoices(mainOnly), null, id);
    assert.deepEqual(accountCurrencyChoices(currencies), ['INR', 'USD', 'JPY'], id);
  }
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const route = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  assert.match(route, /currencyChoices:\s*accountCurrencyChoices\(currencies\)\?\.map/);
  assert.match(
    screen,
    /const showCurrency =\s*\(currencyControl \?\? 'currencyControl' in spec\) && currencyChoices !== null/,
  );
  assert.doesNotMatch(screen, /subCodes|useCurrencySettings/);
});

test('one amount row per form carries the inline currency selector and all amounts share its code', () => {
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const route = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  const specs = screen.slice(
    screen.indexOf('const fieldSpecs'),
    screen.indexOf('const inputIcons'),
  );
  const card = screen.slice(screen.indexOf("case 'credit-card':"), screen.indexOf("case 'loan':"));

  const controllingFields = [...specs.matchAll(/(\w+): \{[^}]*?currencyControl: true/g)].map(
    ([, field]) => field,
  );
  assert.deepEqual(controllingFields, [
    'openingAmount',
    'creditLimit',
    'originalPrincipal',
    'emiAmount',
    'investedCost',
  ]);
  assert.match(card, /field="outstanding"[^>]*?\{\.\.\.draftInput\}/);
  assert.match(card, /field="creditLimit"[^>]*?\{\.\.\.draftInput\}/);
  assert.match(screen, /currency: draft.currency/);
  assert.match(screen, /trailing=\{\s*showCurrency \? \(\s*<AmountCurrencyChoices/);
  assert.doesNotMatch(screen, /accountCurrencyChangeHint/);
  assert.match(
    screen,
    /value=\{currency\}\s+onChange=\{\(value\) => onAction\(\{ type: 'currency', value \}\)\}/,
  );
  assert.match(
    route,
    /CURRENCY_OPTIONS\.find\(\(\{ code \}\) => code === draft.currency\)\?\.symbol/,
  );
  assert.doesNotMatch(screen + route, /AccountCurrencyPicker|pickerVisible|addCurrencyPending/);
});

test('inline currency boxes follow the input, scroll horizontally and keep checked state in place', () => {
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const choices = controls.slice(
    controls.indexOf('export function AmountCurrencyChoices'),
    controls.indexOf('export function AccountChoices'),
  );

  assert.match(
    controls,
    /<View style=\{\{ flex: 1, minWidth: '0%' \}\}>\{input\}<\/View>[\s\S]*?\{trailing\}/,
  );
  assert.match(choices, /<ScrollView\s+horizontal\s+keyboardShouldPersistTaps="handled"/);
  assert.match(
    choices,
    /width: options.length \* theme.buttons.minimumHeight,[\s\S]*?maxWidth: '50%'/,
  );
  assert.match(choices, /options\.map\(\(option\) =>/);
  assert.match(choices, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(choices, /const selected = option.value === value/);
  assert.match(choices, /accessibilityHint=\{selected \? undefined : amountResetHint\}/);
  assert.match(choices, /paddingEnd: theme.space.xxs,\s+alignItems: 'flex-end'/);
  assert.match(choices, /onPress=\{\(\) => onChange\(option.value\)\}/);
  assert.match(
    choices,
    /width: theme.buttons.currencyChoiceSize,\s+height: theme.buttons.currencyChoiceSize/,
  );
});

test('successive currency taps select the requested Sub or Main code', () => {
  let draft = newAccountDraft('bank', 'INR');
  for (const code of ['USD', 'JPY', 'INR'] as const) {
    draft = updateAccountDraft(draft, { type: 'currency', value: code }, currencies);
    assert.equal(draft.currency, code);
    assert.deepEqual(accountCurrencyChoices(currencies), ['INR', 'USD', 'JPY']);
  }
});

test('currency changes clear each group’s amounts while retaining all other draft data', () => {
  const monetaryFields = {
    cash: ['openingAmount'],
    bank: ['openingAmount'],
    'credit-card': ['outstanding', 'creditLimit'],
    wallet: ['openingAmount'],
    loan: ['originalPrincipal', 'fees', 'emiAmount'],
    investment: ['investedCost'],
  } satisfies Record<PreviewGroup, readonly DraftField[]>;

  for (const { id } of BUILT_IN_ACCOUNT_GROUPS) {
    if (!isPreviewGroup(id)) continue;
    const draft = replay(id, [
      { type: 'currency', value: 'USD' },
      ...Object.keys(newAccountDraft(id, 'USD').fields).map((field): AccountFormAction => ({
        type: 'text',
        field: field as DraftField,
        value: '123',
      })),
      { type: 'mode.open' },
      { type: 'mode.name', value: 'Everyday' },
      { type: 'mode.apply' },
      { type: 'mode.open', id: 1 },
    ]);
    const cleared = Object.fromEntries(monetaryFields[id].map((field) => [field, '']));
    const expected = { ...draft, currency: 'JPY', fields: { ...draft.fields, ...cleared } };

    assert.equal(reconcileAccountDraftCurrency(draft, 'INR', currencies), draft, id);
    assert.deepEqual(
      updateAccountDraft(draft, { type: 'currency', value: 'JPY' }, currencies),
      expected,
      id,
    );

    const mainOnly = draftCurrencies({ mainCode: 'JPY', subCodes: [] });
    assert.equal(
      updateAccountDraft(draft, { type: 'currency', value: 'JPY' }, mainOnly),
      draft,
      id,
    );
    const reconciled = reconcileAccountDraftCurrency(draft, 'JPY', mainOnly);
    assert.deepEqual(reconciled, expected, id);
    assert.equal(accountCurrencyChoices(mainOnly), null, id);

    const readded = draftCurrencies({ mainCode: 'JPY', subCodes: ['USD'] });
    assert.equal(reconcileAccountDraftCurrency(reconciled, 'JPY', readded), reconciled, id);
    assert.deepEqual(accountCurrencyChoices(readded), ['JPY', 'USD'], id);
  }

  const route = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  assert.match(route, /if \(current !== session\) setSession\(current\)/);
});

test('Wallet uses the independent account currency selector and clears amounts on change', () => {
  const draft = replay('wallet', [
    { type: 'text', field: 'name', value: 'Wallet balance' },
    { type: 'currency', value: 'USD' },
    { type: 'text', field: 'openingAmount', value: '13.50' },
  ]);
  assert.deepEqual(accountCurrencyChoices(currencies), ['INR', 'USD', 'JPY']);
  const changed = updateAccountDraft(draft, { type: 'currency', value: 'JPY' }, currencies);
  assert.deepEqual(changed.fields, { name: 'Wallet balance', description: '', openingAmount: '' });
  assert.equal(changed.currency, 'JPY');
});

test('group fields render typed drafts and Card and Loan share unavailable payment controls', () => {
  const expectedFields = {
    cash: ['openingAmount'],
    bank: ['openingAmount'],
    'credit-card': ['outstanding', 'creditLimit', 'statementDate', 'dueDate'],
    wallet: ['openingAmount'],
    loan: ['emiAmount', 'originalPrincipal', 'fees', 'interestRate', 'startDate'],
    investment: ['investedCost', 'startDate', 'tenure'],
  } satisfies Record<PreviewGroup, readonly string[]>;
  const expectedRendered = {
    ...expectedFields,
    'credit-card': ['outstanding', 'creditLimit'],
    loan: [
      'originalPrincipal',
      'interestRate',
      'emiAmount',
      'originalPrincipal',
      'emiAmount',
      'fees',
      'interestRate',
    ],
    investment: ['investedCost', 'tenure'],
  } satisfies Record<PreviewGroup, readonly string[]>;
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const groupFields = screen.slice(screen.indexOf('function GroupFields'));
  assert.equal(screen.match(/field="name"/g)?.length, 1);
  assert.match(screen, /field="name"[\s\S]*?accountCardName/);
  assert.doesNotMatch(screen, /field="description"/);
  assert.match(screen, /draft.group === 'bank' \? \(\s*<BankPaymentModes/);
  assert.match(groupFields, /case 'cash':\s*case 'bank':\s*case 'wallet':/);
  for (const { id } of BUILT_IN_ACCOUNT_GROUPS) {
    if (!isPreviewGroup(id)) continue;
    const sectionGroup = id === 'cash' || id === 'bank' ? 'wallet' : id;
    const [section] = groupFields.split("case '" + sectionGroup + "':")[1]?.split(/case '/) ?? [];
    assert.ok(section, id);
    const rendered = [...section.matchAll(/<DraftInput\s+field="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.deepEqual(rendered, expectedRendered[id], id);
    assert.deepEqual(
      Object.keys(newAccountDraft(id, 'INR').fields).sort(),
      [...expectedFields[id], 'name', 'description'].sort(),
    );
  }
  assert.match(groupFields, /direction === 'given'/);
  assert.match(groupFields, /accountLoanAmountLent/);
  assert.match(groupFields, /accountLoanStartDate/);
  assert.match(groupFields, /accountLoanInstallmentOptional/);
  assert.doesNotMatch(
    groupFields.slice(
      groupFields.indexOf("direction === 'given'"),
      groupFields.indexOf('return ('),
    ),
    /field="fees"|accountAutoPay|PaymentFromField|mode="collect"|accountCollectInto/,
  );
  assert.match(
    groupFields,
    /field="emiAmount"[\s\S]*?accountLoanInstallmentOptional[\s\S]*?currencyControl=\{false\}/,
  );
  assert.match(groupFields, /field="emiAmount"\s+info=\{false\}\s+currencyControl=\{false\}/);
  const loanDraft = newAccountDraft('loan', 'INR');
  assert.equal(loanDraft.group, 'loan');
  assert.equal(loanDraft.moreDetailsOpen, false);
  assert.equal(loanDraft.fieldInfo, null);
  assert.equal(en.accountName, 'Account Name');
  assert.equal(en.accountCardName, 'Card Name');
  assert.equal(en.accountCardOutstanding, 'Opening Outstanding');
  assert.equal(en.accountCardStatementDate, 'Billing Cycle Start Date');
  assert.equal(en.accountPayFrom, 'Payment From');
  assert.equal(en.accountPayFromCaption, 'From');
  assert.equal(en.accountPayFromPlaceholder, 'Payment');
  assert.equal(en.accountLoanAmountLent, 'Amount Lent');
  assert.equal(en.accountLoanStartDate, 'Start Date');
  assert.equal(en.accountLoanInstallmentOptional, 'Installment (Optional)');
  assert.doesNotMatch(
    readFileSync('src/shared/i18n/strings.ts', 'utf8'),
    /accountCollectInto|accountLoanCollectIntoInfo/,
  );
  assert.match(
    screen,
    /<AccountField\s+label="accountPayFromCaption"\s+appearance="borderless"\s+textSize="title"/,
  );
  const paymentField = screen.slice(
    screen.indexOf('function PaymentFromField'),
    screen.indexOf('function GroupFields'),
  );
  assert.equal(screen.match(/<PaymentFromField \/>/g)?.length ?? 0, 0);
  assert.match(groupFields, /field="creditLimit"[^>]*\/>\s*<PaymentFromField picker=/);
  assert.match(
    groupFields,
    /picker=\{paymentSource\} \/>\s*\{cardDates \? \(\s*<>\s*<AppDayOfMonthField[\s\S]*?accountCardStatementDate[\s\S]*?accountCardDueDate/,
  );
  assert.match(
    groupFields,
    /field="originalPrincipal"[^>]*\/>\s*<DraftInput\s+field="emiAmount"\s+info=\{false\}\s+currencyControl=\{false\}[\s\S]*?\{loanDates \? \(\s*<AppDateField[\s\S]*?accountLoanFirstEmiDate/,
  );
  assert.match(
    groupFields,
    /draft\.moreDetailsOpen \? \(\s*<>\s*<DraftInput field="fees"[\s\S]*?field="interestRate"/,
  );
  assert.doesNotMatch(
    groupFields.slice(
      groupFields.indexOf('accountLoanFirstEmiDate'),
      groupFields.indexOf("case 'investment':"),
    ),
    /PaymentFromField|DisabledAutoPay|accountAutoPay/,
  );
  assert.match(groupFields, /moreDetails\.toggle/);
  assert.match(groupFields, /AppPopupChevron open=\{draft\.moreDetailsOpen\}/);
  assert.match(groupFields, /field="fees"/);
  assert.match(groupFields, /field="interestRate"/);
  assert.match(screen, /fieldInfo\.open/);
  assert.match(screen, /LoanFieldInfoTip/);
  assert.match(screen, /AccountFieldInfoMark/);
  assert.match(screen, /accountLoanAmountInfo/);
  assert.match(screen, /accountLoanFeesInfo/);
  assert.match(screen, /accountLoanInterestRateInfo/);
  assert.equal(en.accountLoanFieldInfo, 'About this field');
  assert.equal(en.closeLoanFieldInfo, 'Close field information');
  assert.match(en.accountLoanAmountInfo, /original sanctioned loan amount/);
  assert.match(en.accountLoanFeesInfo, /upfront charges/);
  assert.match(en.accountLoanInterestRateInfo, /interest rate as a percent/);
  assert.doesNotMatch(groupFields, /outstandingPrincipal|accountLoanOutstandingPrincipal/);
  const investmentSection = groupFields.slice(groupFields.indexOf("case 'investment':"));
  assert.doesNotMatch(
    investmentSection,
    /PaymentFromField|accountAutoPay|accountInvestmentType|accountInvestmentValuation|investmentKind/,
  );
  assert.match(
    investmentSection,
    /field="investedCost"[\s\S]*?accountInvestmentStartDate[\s\S]*?field="tenure"/,
  );
  assert.equal(en.accountInvestmentCost, 'Amount');
  assert.equal(en.accountInvestmentStartDate, 'Start Date');
  assert.equal(en.accountInvestmentTenure, 'Tenure (Optional)');
  assert.equal(en.accountInvestmentTenureMonths, 'months');
  assert.match(paymentField, /placeholder=\{t\('accountPayFromPlaceholder'\)\}/);
  assert.match(paymentField, /accessibilityLabel=\{t\('accountPayFrom'\)\}/);
  assert.match(paymentField, /accessibilityState=\{\{ disabled: true \}\}/);
  assert.match(paymentField, /editable=\{false\}\s+value=\{selectedName \?\? ''\}/);
  assert.doesNotMatch(paymentField, /labelAsPlaceholder|trailing=|onChangeText|mode=|collect/);
  assert.doesNotMatch(groupFields, /accountPayFromUnavailable/);
  assert.doesNotMatch(groupFields, /accountWalletBank|showWalletFunding|field="provider"/);
  assert.equal(en.accountCardCreditLimit, 'Total Credit Limit');
  assert.equal(en.accountCardDueDate, 'Payment Due Date');
  assert.equal(en.accountAutoPay, 'Auto Pay');
  assert.match(en.accountAutoPayUnavailable, /Tracking only.*never debits/);
  assert.match(
    screen,
    /<GroupFields[\s\S]*?\/>\s*\{draft.group === 'credit-card' \? <DisabledAutoPay \/> : null\}/,
  );
  assert.doesNotMatch(screen, /DraftInput field="description"/);
  assert.match(screen, /function DisabledAutoPay/);
  assert.equal(screen.match(/<Switch\s/g)?.length, 1);
  assert.equal(screen.match(/<DisabledAutoPay \/>/g)?.length, 1);
  const autoPay = screen.match(/<Switch\s[\s\S]*?\/>/)?.[0];
  assert.ok(autoPay);
  assert.match(autoPay, /accessibilityHint=\{t\('accountAutoPayUnavailable'\)\}/);
  assert.match(autoPay, /value=\{false\}\s+disabled\s*\/>/);
  assert.doesNotMatch(autoPay, /onValueChange|onChange|onPress/);
  assert.doesNotMatch(groupFields, /DisabledAutoPay|accountAutoPay|accountTracking/);
  const choices = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  assert.match(choices, /<AppTextField\s+accessibilityLabel=\{t\(label\)\}/);
  assert.match(choices, /accessibilityRole="radiogroup"\s+accessibilityLabel=\{t\(label\)\}/);
  assert.match(choices, /accessibilityRole="radio"/);
  assert.match(choices, /accessibilityState=\{\{ checked: selected, disabled \}\}/);
  assert.match(choices, /disabled=\{disabled\}/);
  assert.match(choices, /function AccountFieldInfoMark/);
  assert.match(choices, /width=\{size\.dp16\}/);
  assert.match(choices, /info-icon\.json/);
  assert.match(choices, /SvgXml[\s\S]*?xml=\{infoIcon\}/);
  assert.match(choices, /info\?: ReactNode/);
  assert.match(screen, /preferredWidth=\{theme\.optionPopup\.width \+ theme\.space\.xl\}/);
  assert.match(screen, /align="start"/);
  assert.match(screen, /function LoanFieldInfoTip[\s\S]*?<AppText\s+muted[\s\S]*?\{body\}/);
  const infoIcon = JSON.parse(
    readFileSync('src/shared/assets/google-material-icons/info-icon.json', 'utf8'),
  );
  const infoSvg = readFileSync('src/shared/assets/google-material-icons/info.svg', 'utf8').trim();
  assert.equal(infoIcon, infoSvg);
  assert.match(infoSvg, /viewBox="0 -960 960 960"/);
  assert.match(infoSvg, /M460-300h40v-220/);
});

test('Loan field info and direction switch keep Borrowed and Given drafts separate', () => {
  let draft = newAccountDraft('loan', 'INR');
  assert.ok(draft.group === 'loan');
  assert.equal(draft.direction, 'borrowed');
  draft = updateAccountDraft(
    draft,
    { type: 'fieldInfo.open', field: 'originalPrincipal' },
    currencies,
  );
  assert.ok(draft.group === 'loan');
  assert.equal(draft.fieldInfo, 'originalPrincipal');
  draft = updateAccountDraft(draft, { type: 'moreDetails.toggle' }, currencies);
  assert.ok(draft.group === 'loan');
  assert.equal(draft.moreDetailsOpen, true);
  draft = updateAccountDraft(draft, { type: 'fieldInfo.open', field: 'fees' }, currencies);
  assert.ok(draft.group === 'loan');
  assert.equal(draft.fieldInfo, 'fees');
  draft = updateAccountDraft(draft, { type: 'text', field: 'emiAmount', value: '10' }, currencies);
  draft = updateAccountDraft(
    draft,
    { type: 'text', field: 'originalPrincipal', value: '100' },
    currencies,
  );
  draft = updateAccountDraft(draft, { type: 'loan.direction', value: 'given' }, currencies);
  assert.ok(draft.group === 'loan');
  assert.equal(draft.direction, 'given');
  assert.equal(draft.moreDetailsOpen, false);
  assert.equal(draft.fieldInfo, null);
  assert.equal(draft.fields.emiAmount, '');
  assert.equal(draft.fields.originalPrincipal, '');
  assert.equal(draft.fields.fees, '');
  assert.equal(draft.fields.interestRate, '');
  draft = updateAccountDraft(draft, { type: 'fieldInfo.open', field: 'interestRate' }, currencies);
  assert.ok(draft.group === 'loan');
  assert.equal(draft.fieldInfo, 'interestRate');
  draft = updateAccountDraft(draft, { type: 'moreDetails.toggle' }, currencies);
  assert.ok(draft.group === 'loan');
  assert.equal(draft.moreDetailsOpen, true);
  draft = updateAccountDraft(draft, { type: 'fieldInfo.open', field: 'emiAmount' }, currencies);
  assert.ok(draft.group === 'loan');
  assert.equal(draft.fieldInfo, 'emiAmount');
  draft = updateAccountDraft(draft, { type: 'moreDetails.toggle' }, currencies);
  assert.ok(draft.group === 'loan');
  assert.equal(draft.moreDetailsOpen, false);
  assert.equal(draft.fieldInfo, null);
});

test('Credit Card dates use a day-only wheel and Loan and Investment keep full calendar dates', () => {
  const initial = newAccountDraft('credit-card', 'INR');
  assert.ok(initial.group === 'credit-card');
  assert.equal(initial.fields.statementDate, '01');
  assert.equal(initial.fields.dueDate, '15');

  for (const field of ['statementDate', 'dueDate'] as const) {
    for (const invalid of ['00', '32', 'abc', '2026-11-24']) {
      assert.equal(
        updateAccountDraft(initial, { type: 'text', field, value: invalid }, currencies),
        initial,
      );
    }
    const changed = updateAccountDraft(initial, { type: 'text', field, value: '29' }, currencies);
    assert.ok(changed.group === 'credit-card');
    assert.equal(changed.fields[field], '29');
  }

  assert.equal(monthDayFromWheelIndex(30), 31);
  assert.equal(monthDayFromWheelIndex(31), 1);
  assert.equal(monthDayFromWheelIndex(32), 2);

  const update = (session: AccountAddSession, action: AccountAddAction) =>
    updateAccountAddSession(session, action, 'INR', currencies);
  let session = update(newAccountAddSession(true), { type: 'group.select', group: 'credit-card' });
  session = update(session, { type: 'date.open', field: 'statementDate' });
  assert.ok(session.datePicker);
  assert.equal(session.datePicker.field, 'statementDate');
  assert.equal(session.datePicker.dayIndex, initialMonthDayWheelIndex(1));
  const statementId = session.datePicker.id;
  const day28 = initialMonthDayWheelIndex(28);
  session = update(session, {
    type: 'date.change',
    id: statementId,
    part: 'day',
    value: day28,
  });
  const afterStatement = session.drafts['credit-card'];
  assert.ok(afterStatement?.group === 'credit-card');
  assert.equal(afterStatement.fields.statementDate, '28');
  assert.equal(session.datePicker?.dayIndex, day28);
  session = update(session, {
    type: 'date.change',
    id: statementId,
    part: 'day',
    value: day28 + 3,
  });
  const afterThirtyOne = session.drafts['credit-card'];
  assert.ok(afterThirtyOne?.group === 'credit-card');
  assert.equal(afterThirtyOne.fields.statementDate, '31');
  session = update(session, {
    type: 'date.change',
    id: statementId,
    part: 'day',
    value: day28 + 4,
  });
  const afterWrap = session.drafts['credit-card'];
  assert.ok(afterWrap?.group === 'credit-card');
  assert.equal(afterWrap.fields.statementDate, '01');
  assert.equal(session.datePicker?.dayIndex, day28 + 4);
  session = update(session, { type: 'date.close', id: statementId });
  session = update(session, { type: 'date.open', field: 'dueDate' });
  assert.ok(session.datePicker);
  const dueId = session.datePicker.id;
  const day5 = initialMonthDayWheelIndex(5);
  session = update(session, { type: 'date.change', id: dueId, part: 'day', value: day5 });
  const afterDue = session.drafts['credit-card'];
  assert.ok(afterDue?.group === 'credit-card');
  assert.equal(afterDue.fields.dueDate, '05');
  assert.equal(
    update(session, { type: 'date.change', id: dueId, part: 'month', value: 1 }),
    session,
  );
  assert.equal(
    update(session, {
      type: 'date.change',
      id: dueId,
      part: 'day',
      value: monthDayWheelCount,
    }),
    session,
  );

  const loan = replay('loan', [{ type: 'text', field: 'startDate', value: '2026-11-24' }]);
  const investment = replay('investment', [
    { type: 'text', field: 'startDate', value: '2026-11-24' },
    { type: 'text', field: 'tenure', value: '12' },
  ]);
  assert.ok(loan.group === 'loan' && investment.group === 'investment');
  assert.equal(loan.fields.startDate, '2026-11-24');
  assert.equal(investment.fields.startDate, '2026-11-24');
  assert.equal(investment.fields.tenure, '12');
  assert.equal(
    updateAccountDraft(investment, { type: 'text', field: 'tenure', value: '0' }, currencies),
    investment,
  );
  assert.equal(
    updateAccountDraft(
      investment,
      { type: 'date.part', field: 'startDate', part: 'day', value: '1' },
      currencies,
    ),
    investment,
  );

  assert.equal(en.accountCardMonthlySuffix, 'of every month');
  assert.equal(Object.hasOwn(datePickerTokens, 'dayPickerWidth'), false);
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const dayField = readFileSync('src/shared/ui/app-day-of-month-field.tsx', 'utf8');
  const controller = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  const popup = readFileSync('src/shared/ui/popup-position.ts', 'utf8');
  assert.match(form, /<AppDayOfMonthField[\s\S]*?accountCardStatementDate/);
  assert.match(form, /<AppDayOfMonthField[\s\S]*?accountCardDueDate/);
  assert.doesNotMatch(form, /DraftInput field="statementDate"|DraftInput field="dueDate"/);
  assert.match(dayField, /count=\{monthDayWheelCount\}/);
  assert.match(dayField, /preferredWidth=\{cardSize\}/);
  assert.match(dayField, /preferredHeight=\{cardSize\}/);
  assert.match(dayField, /align="start"/);
  assert.match(dayField, /alignOffset=\{textColumnOffset\}/);
  assert.match(dayField, /iconRoles\.textField \+ theme\.space\.sm/);
  assert.match(popup, /alignOffset/);
  assert.doesNotMatch(dayField, /accountDateMonth|accountDateYear/);
  assert.match(dayField, /accountCardMonthlySuffix/);
  assert.match(controller, /cardDates:\s*draft\.group === 'credit-card'/);
  assert.match(form, /keyboardType=\{date \|\| months \? 'number-pad'/);
  assert.match(form, /accountInvestmentTenureMonths/);
});

test('Investment Start Date uses the shared wheel date field and keeps optional tenure months', () => {
  const today = '2026-11-25';
  const update = (session: AccountAddSession, action: AccountAddAction) =>
    updateAccountAddSession(session, action, 'INR', currencies, today);
  let session = update(newAccountAddSession(true), { type: 'group.select', group: 'investment' });
  const draft = () => {
    const investment = session.drafts.investment;
    assert.ok(investment?.group === 'investment');
    return investment.fields;
  };
  assert.equal(draft().startDate, today);
  assert.equal(draft().tenure, '');
  assert.equal(Object.hasOwn(session.drafts.investment ?? {}, 'investmentKind'), false);
  session = update(session, { type: 'date.open', field: 'startDate' });
  assert.ok(session.datePicker);
  const id = session.datePicker.id;
  session = update(session, {
    type: 'date.change',
    id,
    part: 'day',
    value: calendarWheelIndex({ year: 2026, month: 11, day: 24 }, 'day'),
  });
  assert.equal(draft().startDate, '2026-11-24');
  session = update(session, { type: 'date.close', id });
  session = update(session, {
    type: 'form',
    group: 'investment',
    action: { type: 'text', field: 'tenure', value: '12' },
  });
  assert.equal(draft().tenure, '12');
  session = update(session, {
    type: 'form',
    group: 'investment',
    action: { type: 'text', field: 'tenure', value: '120' },
  });
  assert.equal(draft().tenure, '120');
  session = update(session, {
    type: 'form',
    group: 'investment',
    action: { type: 'text', field: 'tenure', value: '1200' },
  });
  assert.equal(draft().tenure, '120');

  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const controller = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  assert.match(form, /case 'investment':[\s\S]*?accountInvestmentStartDate[\s\S]*?field="tenure"/);
  assert.match(form, /maxLength=\{date \? 2 : months \? 3 : undefined\}/);
  assert.match(controls, /\(props\.maxLength \?\? 2\) \/ 2/);
  assert.doesNotMatch(form, /accountInvestmentType|field="valuation"|valuationDate/);
  assert.doesNotMatch(controller, /accountInvestmentType|investmentKinds|investment\.kind/);
  assert.match(controller, /draft\.group === 'loan' \|\| draft\.group === 'investment'/);
});

test('wheel projection preserves the center and curves and fades symmetrically', () => {
  const { rowHeight, visibleRows, paddingHorizontal, paddingVertical } = datePickerTokens;
  assert.equal(rowHeight, 32);
  assert.equal(rowHeight * visibleRows, 160);
  assert.equal(paddingHorizontal, 8);
  assert.equal(paddingVertical, 6);
  assert.equal(rowHeight * visibleRows + paddingVertical * 2, 172);
  assert.equal(wheelPickerTokens.anglePerRow, 22);
  const center = wheelProjection(0, rowHeight);
  const near = wheelProjection(1, rowHeight);
  const far = wheelProjection(3, rowHeight);
  const opposite = wheelProjection(-3, rowHeight);

  assert.deepEqual(center, { translateY: 0, rotateX: 0, opacity: 1, scale: 1 });
  assert.ok(near.opacity < center.opacity && far.opacity < near.opacity);
  assert.ok(far.scale < near.scale && near.scale < center.scale);
  assert.equal(near.rotateX, 22);
  assert.equal(wheelProjection(2, rowHeight).rotateX, 44);
  assert.ok(far.rotateX > near.rotateX && far.rotateX < 90);
  assert.ok(far.translateY > near.translateY && near.translateY > 0);
  assert.equal(opposite.translateY, -far.translateY);
  assert.equal(opposite.rotateX, -far.rotateX);
  assert.equal(opposite.opacity, far.opacity);
  assert.equal(wheelProjection(4, rowHeight).opacity, 0);
  // The third neighbor should remain visible close to the viewport edge.
  const farCenter = Math.abs(far.translateY - 3 * rowHeight);
  assert.ok(far.opacity > 0.1);
  assert.ok(farCenter > (rowHeight * visibleRows) / 2 - rowHeight / 2);
  assert.ok(farCenter < (rowHeight * visibleRows) / 2);
  assert.equal(wheelProjection(84 / 22, rowHeight).opacity, 0);
  // Remove the native linear displacement: the center follows one fixed-radius arc.
  let previousY = 0;
  for (let distance = 0.125; distance <= 2; distance += 0.125) {
    const projected = wheelProjection(distance, rowHeight);
    const centerY = projected.translateY - distance * rowHeight;
    assert.ok(centerY < previousY);
    assert.ok(Math.abs(centerY - previousY) <= rowHeight * 0.125);
    previousY = centerY;
  }

  const samples = wheelProjectionSamples(10, rowHeight);
  assert.ok(samples.some((sample) => sample.offset === 10 * rowHeight && sample.opacity === 1));
  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    assert.ok(previous && current && current.offset > previous.offset);
  }
});

test('continuous calendar detents carry days and months across years', () => {
  const end = { year: 2026, month: 12, day: 31 };
  const next = { year: 2027, month: 1, day: 1 };
  const dayIndex = calendarWheelIndex(end, 'day');
  assert.deepEqual(selectCalendarWheel(end, 'day', dayIndex + 1), next);
  assert.deepEqual(selectCalendarWheel(next, 'day', dayIndex), end);
  assert.equal(calendarWheelLabel('day', dayIndex + 1), '01');
  const monthIndex = calendarWheelIndex(end, 'month');
  assert.equal(calendarWheelLabel('month', monthIndex + 1), 'Jan');
  assert.deepEqual(selectCalendarWheel(end, 'month', monthIndex + 1), {
    year: 2027,
    month: 1,
    day: 31,
  });
  const leap = { year: 2028, month: 2, day: 28 };
  const leapIndex = calendarWheelIndex(leap, 'day');
  assert.deepEqual(selectCalendarWheel(leap, 'day', leapIndex + 1), {
    ...leap,
    day: 29,
  });
  assert.deepEqual(selectCalendarWheel(leap, 'day', leapIndex + 2), {
    year: 2028,
    month: 3,
    day: 1,
  });
  assert.equal(selectCalendarWheel(end, 'day', -1), end);
  assert.equal(selectCalendarWheel(end, 'day', calendarWheelCounts.day), end);
  assert.equal(calendarWheelCounts.month, 2412);
  assert.equal(calendarWheelCounts.year, 201);
});

test('day wheel retains physical position when only month or year changes', () => {
  const before = { year: 2026, month: 1, day: 24 };
  const index = initialDayWheelIndex(before);
  const month = { year: 2026, month: 2, day: 24 };
  const year = { year: 2027, month: 2, day: 24 };
  assert.equal(nextDayWheelIndex(index, before, month, 'month'), index);
  assert.equal(nextDayWheelIndex(index, month, year, 'year'), index);
  const bounds = dayWheelBounds(year, index);
  assert.equal(index + bounds.origin, calendarWheelIndex(year, 'day'));
  assert.ok(bounds.minimum >= 0 && bounds.maximum < dayWheelCount);
  assert.equal(calendarWheelLabel('day', index + bounds.origin), '24');

  const end = { year: 2026, month: 1, day: 31 };
  const feb = { year: 2026, month: 2, day: 28 };
  const endIndex = initialDayWheelIndex(end);
  const febIndex = nextDayWheelIndex(endIndex, end, feb, 'month');
  assert.equal(febIndex, endIndex - 3);
  const march = { year: 2026, month: 3, day: 1 };
  const marchIndex = nextDayWheelIndex(febIndex, feb, march, 'day');
  assert.equal(marchIndex, febIndex + 1);
  assert.equal(dayWheelBounds(march, marchIndex).origin, dayWheelBounds(feb, febIndex).origin);
  assert.equal(nextDayWheelIndex(marchIndex, march, feb, 'day'), febIndex);
});

test('year selection leaves the month detent stable and calendar carry-over moves it', () => {
  const before = { year: 2026, month: 12, day: 24 };
  const index = initialMonthWheelIndex(before);
  const nextYear = { ...before, year: 2027 };
  assert.equal(nextMonthWheelIndex(index, before, nextYear, 'year'), index);
  const bounds = monthWheelBounds(nextYear, index);
  assert.equal(index + bounds.origin, calendarWheelIndex(nextYear, 'month'));
  assert.equal(calendarWheelLabel('month', index + bounds.origin), 'Dec');
  assert.ok(bounds.minimum >= 0 && bounds.maximum < monthWheelCount);

  const january = { year: 2028, month: 1, day: 24 };
  const janIndex = nextMonthWheelIndex(index, nextYear, january, 'month');
  assert.equal(janIndex, index + 1);
  assert.equal(nextMonthWheelIndex(janIndex, january, nextYear, 'month'), index);

  const lastDay = { year: 2027, month: 12, day: 31 };
  const firstDay = { year: 2028, month: 1, day: 1 };
  assert.equal(nextMonthWheelIndex(index, lastDay, firstDay, 'day'), index + 1);
  assert.equal(nextMonthWheelIndex(index + 1, firstDay, lastDay, 'day'), index);
  for (const year of [1900, 2100, 1900]) {
    const candidate = { ...before, year };
    const detent = nextMonthWheelIndex(index, before, candidate, 'year');
    const limits = monthWheelBounds(candidate, detent);
    assert.equal(detent, index);
    assert.ok(limits.minimum >= 0 && limits.maximum < monthWheelCount);
  }
});

test('wheel controlled echoes cannot interrupt native motion', () => {
  assert.equal(shouldAlignWheel(5, 5, false, false), false);
  assert.equal(shouldAlignWheel(4, 5, true, false), false);
  assert.equal(shouldAlignWheel(4, 5, false, true), false);
  assert.equal(shouldAlignWheel(4, 5, false, false), true);
});

test('linked calendar detents animate nearby changes without long virtualized scrolls', () => {
  assert.equal(shouldAnimateWheelAlignment(1500, 1501, false), true);
  assert.equal(shouldAnimateWheelAlignment(1501, 1500, false), true);
  assert.equal(shouldAnimateWheelAlignment(126, 127, false), true);
  assert.equal(shouldAnimateWheelAlignment(10, 22, false), true);
  assert.equal(shouldAnimateWheelAlignment(10, 23, false), false);
  assert.equal(shouldAnimateWheelAlignment(10, 10, false), false);
  assert.equal(shouldAnimateWheelAlignment(10, 11, true), false);
});

test('Loan wheels use local Today and retain live valid dates after dismissal', () => {
  const today = '2024-01-31';
  assert.equal(localCalendarToday(new Date(2024, 0, 31, 23, 59)), today);
  assert.equal(calendarMonths[8], 'Sep');
  assert.equal(parseCalendarDate('2025-02-29'), null);
  assert.deepEqual(parseCalendarDate('2024-02-29'), { year: 2024, month: 2, day: 29 });
  for (const invalid of ['2024-2-29', '2024-02', '2024-00-01', '2024-04-31', '2101-01-01']) {
    assert.equal(parseCalendarDate(invalid), null);
  }
  const update = (session: AccountAddSession, action: AccountAddAction) =>
    updateAccountAddSession(session, action, 'INR', currencies, today);
  let session = update(newAccountAddSession(true), { type: 'group.select', group: 'loan' });
  const dates = () => {
    const loan = session.drafts.loan;
    assert.ok(loan?.group === 'loan');
    return loan.fields;
  };
  assert.equal(dates().startDate, today);
  assert.equal(Object.hasOwn(dates(), 'nextDueDate'), false);
  session = update(session, { type: 'date.open', field: 'startDate' });
  assert.ok(session.datePicker);
  const id = session.datePicker.id;
  const initialDayIndex = session.datePicker.dayIndex;
  const initialMonthIndex = session.datePicker.monthIndex;
  assert.equal(update(session, { type: 'group.open' }), session);
  assert.equal(update(session, { type: 'options.open' }), session);
  session = update(session, {
    type: 'date.change',
    id,
    part: 'month',
    value: calendarWheelIndex({ year: 2024, month: 2, day: 1 }, 'month'),
  });
  assert.equal(dates().startDate, '2024-02-29');
  assert.equal(session.datePicker?.dayIndex, initialDayIndex - 2);
  assert.equal(session.datePicker?.monthIndex, initialMonthIndex + 1);
  session = update(session, {
    type: 'date.change',
    id,
    part: 'year',
    value: calendarWheelIndex({ year: 2025, month: 1, day: 1 }, 'year'),
  });
  assert.equal(dates().startDate, '2025-02-28');
  assert.equal(session.datePicker?.dayIndex, initialDayIndex - 3);
  assert.equal(session.datePicker?.monthIndex, initialMonthIndex + 1);
  session = update(session, { type: 'date.close', id });
  assert.equal(dates().startDate, '2025-02-28');
  session = update(session, { type: 'group.open' });
  session = update(session, { type: 'group.select', group: 'cash' });
  assert.equal(update(session, { type: 'date.open', field: 'startDate' }), session);
  session = update(session, { type: 'group.open' });
  session = update(session, { type: 'group.select', group: 'loan' });
  assert.equal(dates().startDate, '2025-02-28');

  const field = readFileSync('src/shared/ui/app-date-field.tsx', 'utf8');
  const wheel = readFileSync('src/shared/ui/app-wheel-picker.tsx', 'utf8');
  const popup = readFileSync('src/shared/ui/app-popup-card.tsx', 'utf8');
  assert.equal(field.match(/<AppWheelPicker/g)?.length, 3);
  assert.match(field, /placement="above"/);
  assert.match(field, /align="start"/);
  assert.match(field, /alignOffset=\{textColumnOffset\}/);
  assert.match(field, /fitPopupRows\(/);
  assert.match(popup, /placement === 'above'/);
  assert.match(field, /backgroundColor: theme\.colors\.wheelSelection/);
  assert.match(field, /paddingHorizontal: theme\.datePicker\.paddingHorizontal/);
  assert.match(field, /paddingVertical: theme\.datePicker\.paddingVertical/);
  assert.doesNotMatch(field, /theme\.colors\.segmentedTrack/);
  assert.doesNotMatch(field, /ActionButton|TextInput|AppBottomSheet|onSubmit|onSave/);
  assert.match(wheel, /snapToInterval=\{rowHeight\}/);
  assert.match(wheel, /<Animated\.FlatList/);
  assert.match(wheel, /getItemLayout=/);
  assert.match(wheel, /initialScrollIndex=/);
  assert.match(wheel, /windowSize=/);
  assert.match(wheel, /onScroll=\{onScroll\}/);
  assert.match(wheel, /Animated\.event/);
  assert.match(wheel, /offset\.addListener/);
  assert.match(wheel, /offset\.removeListener/);
  assert.match(wheel, /shouldAnimateWheelAlignment\(lastIndex\.current/);
  assert.match(field, /value=\{physicalDay\}/);
  assert.match(field, /minimumIndex=\{dayBounds\.minimum\}/);
  assert.match(field, /maximumIndex=\{dayBounds\.maximum\}/);
  assert.match(field, /value=\{physicalMonth\}/);
  assert.match(field, /minimumIndex=\{monthBounds\.minimum\}/);
  assert.match(field, /maximumIndex=\{monthBounds\.maximum\}/);
  assert.match(wheel, /if \(!animated\) offset\.setValue/);
  assert.match(wheel, /scrollToOffset\(\{ offset: selected \* rowHeight, animated \}\)/);
  assert.match(wheel, /programmaticTarget\.current = selected/);
  assert.match(wheel, /if \(target !== null\)/);
  assert.match(wheel, /useNativeDriver: Platform\.OS !== 'web'/);
  assert.doesNotMatch(wheel, /offset\.setValue\(event\.nativeEvent\.contentOffset\.y\)/);
  assert.match(
    wheel,
    /shouldAlignWheel\(selected, lastIndex\.current, interacting\.current, echoed\)/,
  );
  assert.match(wheel, /rotateX: offset\.interpolate/);
  assert.match(wheel, /useReducedMotion\(\)/);
  assert.doesNotMatch(wheel, /contentOffset=\{initialOffset\.current\}/);
  assert.match(wheel, /accessibilityRole="adjustable"/);
  assert.match(popup, /onRequestClose=\{onClose\}/);
  assert.match(popup, /onPress=\{onClose\}/);
});

test('main Add Account fields opt into borderless input and the Bank mode sheet stays outlined', () => {
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const bankModes = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  const field = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');

  const mainField = form.match(/<AccountField\s[\s\S]*?\/>/)?.[0];
  const sheetField = bankModes.match(/<AccountField\s[\s\S]*?\/>/)?.[0];
  assert.ok(mainField);
  assert.ok(sheetField);
  assert.match(mainField, /appearance="borderless"/);
  assert.match(sheetField, /label="accountModeName"/);
  assert.match(sheetField, /labelAsPlaceholder/);
  assert.doesNotMatch(sheetField, /appearance=/);
  assert.match(field, /appearance = 'outlined'/);
  assert.match(field, /borderWidth: borderless \? 0 : theme\.navigation\.borderWidth/);
  assert.match(field, /backgroundColor: borderless \? 'transparent' : theme\.colors\.canvas/);
  assert.match(field, /underlineColorAndroid=\{borderless \? 'transparent'/);
});

test('small account captions align above their inputs while icons align beside the value', () => {
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const keyboardForm = readFileSync('src/shared/ui/app-keyboard-form.tsx', 'utf8');
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const bankModes = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  const input = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');
  const row = controls.slice(
    controls.indexOf('export function AccountFormRow'),
    controls.indexOf('export function AccountFieldInfoMark'),
  );

  assert.match(form, /<AppKeyboardForm>[\s\S]*?<AccountFields[\s\S]*?<\/AppKeyboardForm>/);
  assert.match(
    keyboardForm,
    /contentContainerStyle=\{\{ padding: theme.space.md, gap: theme.space.sm \}\}/,
  );
  assert.equal(space.md, 16);
  assert.equal(space.sm, 12);
  assert.equal(textFieldTokens.captionGap, 0);
  assert.match(row, /const rowHeight = minimumHeight \?\? theme.textField.minimumHeight/);
  assert.match(row, /flexDirection: 'row',\s+alignItems: 'center'/);
  assert.match(
    row,
    /importantForAccessibility="no-hide-descendants"[\s\S]*?\{leading\}[\s\S]*?\{t\(label\)\}[\s\S]*?\{children\}/,
  );
  const field = controls.slice(
    controls.indexOf('export function AccountField'),
    controls.indexOf('export function AmountCurrencyChoices'),
  );
  assert.match(field, /<View style=\{\{ gap: theme.textField.captionGap \}\}>/);
  assert.match(
    field,
    /labelAsPlaceholder \? null : \(\s*<View[\s\S]*?marginStart: iconWidth \+ columnGap[\s\S]*?<AppText[\s\S]*?variant="caption"\s+muted[\s\S]*?\{t\(label\)\}[\s\S]*?\{info\}[\s\S]*?flexDirection: 'row'/,
  );
  assert.match(
    field,
    /alignItems: props.multiline \? 'flex-start' : 'center'[\s\S]*?\{leading\}\s*<\/View>\s*\{suffix \? \([\s\S]*?\{input\}<\/View>\s*\)\}\s*\{trailing\}/,
  );
  assert.match(controls, /d=\{rowIcons\[name\]\}[\s\S]*?theme\.colors\.primaryText/);
  assert.match(
    form,
    /textSize=\{field === 'name' \|\| money \|\| date \|\| months \? 'title' : 'section'\}/,
  );
  assert.match(form, /leading=\{leading\}[\s\S]*?textAlign="left"/);
  assert.match(
    form,
    /multiline=\{description\}[\s\S]*?submitBehavior=\{description \? 'blurAndSubmit'/,
  );
  assert.match(
    form,
    /const leading = money \? \([\s\S]*?\{currencySymbol\}[\s\S]*?<AccountFormIcon/,
  );
  assert.match(form, /labelAsPlaceholder=\{field === 'name' \|\| description\}/);
  assert.match(
    form,
    /placeholder=\{calendar \? t\('accountDateDayPlaceholder'\) : money \|\| months \? '0'/,
  );
  assert.match(input, /const growsWithText = borderless && props.multiline/);
  assert.match(input, /includeFontPadding: borderless \? false : undefined/);
  assert.match(input, /paddingVertical: growsWithText \? \(minHeight - lineHeight\) \/ 2/);
  assert.doesNotMatch(input, /numberOfLines|maxHeight/);
  assert.doesNotMatch(bankModes, /leading=/);
});

test('payment mode editor uses compact outlined radios in one horizontal row', () => {
  const source = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  const editor = source.slice(source.indexOf('export function BankModeEditor'));
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const choices = controls.slice(controls.indexOf('export function AccountChoices'));
  const compactRow = choices.slice(choices.indexOf('if (compact)'));
  assert.match(editor, /label="accountModeType"\s+compact/);
  assert.match(editor, /selected: value === editor.kind/);
  assert.match(editor, /type: 'mode.kind', value/);
  assert.match(editor, /const disabled = !availableModeTypes.includes\(value\)/);
  assert.match(choices, /selected && !compact \?/);
  assert.match(choices, /compactOptionHeight/);
  assert.match(choices, /compactLabelSize = theme.segmentedControl.compactOptionLabelSize/);
  assert.match(choices, /fontSize: compactLabelSize/);
  assert.equal(segmentedControlTokens.compactOptionLabelSize, 14);
  assert.equal(segmentedControlTokens.compactOptionHeight, 24);
  assert.match(choices, /borderColor: selected \? theme.colors.primaryText : theme.colors.border/);
  assert.match(choices, /muted=\{disabled \|\| !selected\}/);
  assert.match(compactRow, /<ScrollView\s+horizontal\s+keyboardShouldPersistTaps="handled"/);
  assert.match(compactRow, /\{choices\}\s+<\/ScrollView>/);
  assert.match(controls, /labelAsPlaceholder \? null : <AppText>\{t\(label\)\}<\/AppText>/);
  assert.equal(editor.match(/<ActionButton/g)?.length, 1);
  assert.match(editor, /label=\{t\('accountModeApply'\)\}/);
  assert.doesNotMatch(editor, /AppBottomSheet|Modal|closeAccountPaymentMode/);
});

test('settings routes are distinct and detail routes inherit shared theme motion', () => {
  const more = readFileSync('src/features/settings/use-more-view-model.ts', 'utf8');
  const stack = readFileSync('src/app/_layout.tsx', 'utf8');
  assert.match(more, /case 'account\.groups\.open':\s+router\.push\('\/account-groups'\)/);
  assert.match(more, /case 'account\.manage\.open':\s+router\.push\('\/manage-accounts'\)/);
  assert.match(stack, /name="add-account" options=\{motion\.detail\}/);
  assert.match(stack, /name="manage-accounts" options=\{motion\.detail\}/);
  assert.match(stack, /contentStyle: \{ backgroundColor: theme\.colors\.canvas \}/);
});

test('Account Settings groups both destinations in one card styled like Currency', () => {
  const settings = readFileSync('src/features/settings/more-screen.tsx', 'utf8');
  const accountStart = settings.indexOf("t('accountSettings')");
  const appearanceStart = settings.indexOf("t('appearance')");
  assert.ok(accountStart >= 0 && appearanceStart > accountStart);
  const accounts = settings.slice(accountStart, appearanceStart);
  const card = accounts.indexOf('<View style={settingsCardStyle}>');

  assert.ok(card >= 0);
  assert.ok(accounts.indexOf('accountSettingsRows.map') > card);
  assert.match(
    settings,
    /const accountSettingsRows = \[[\s\S]*?action: 'account\.groups\.open'[\s\S]*?action: 'account\.manage\.open'[\s\S]*?\] as const/,
  );
  assert.match(accounts, /index > 0 \? <View accessible=\{false\} style=\{settingsDividerStyle\}/);
  assert.match(accounts, /onPress=\{\(\) => onAction\(\{ type: action \}\)\}/);
  assert.match(
    settings.slice(appearanceStart),
    /t\('currency'\)[\s\S]*?<View style=\{settingsCardStyle\}>/,
  );
});

test('Accounts plus opens the editor, which presents Group first and keeps Save in the top bar', () => {
  const accounts = readFileSync('src/features/accounts/accounts-screen.tsx', 'utf8');
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const picker = readFileSync('src/features/accounts/account-group-picker.tsx', 'utf8');
  const route = readFileSync('src/features/accounts/accounts-route.tsx', 'utf8');
  const controller = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  const bar = readFileSync('src/shared/ui/app-top-bar.tsx', 'utf8');
  const manage = accounts.slice(accounts.indexOf('export function ManageAccountsScreen'));
  assert.match(accounts, /icon: 'add'.*onPress: onAdd/);
  const tab = accounts.slice(0, accounts.indexOf('export function ManageAccountsScreen'));
  assert.doesNotMatch(tab, /accountsDataUnavailable|<AppText/);
  assert.match(manage, /manageAccountsUnavailable/);
  assert.match(route, /router.navigate\('\/add-account'\)/);
  assert.match(route, /<AddAccountScreen \{\.\.\.useAddAccountViewModel\(\)\}/);
  assert.match(
    controller,
    /addListener\('transitionEnd',[\s\S]*?!data.closing && navigation.isFocused\(\)[\s\S]*?setSession\(presentInitialAccountGroupPicker\)/,
  );
  assert.match(controller, /newAccountAddSession\(reduceMotion \|\| Platform.OS === 'web'\)/);
  assert.match(controller, /animateSheet: !reduceMotion/);
  assert.match(
    form,
    /<AccountPage\s+editing\s+title=\{t\('addAccount'\)\}\s+backLabel=\{t\('closeAddAccount'\)\}\s+onBack=\{onClose\}/,
  );
  const page = readFileSync('src/features/accounts/account-page.tsx', 'utf8');
  assert.match(page, /edges=\{\['top', 'left', 'right'\]\}/);
  assert.doesNotMatch(page, /'bottom'|tab \?/);
  assert.doesNotMatch(accounts, /\btab\b/);
  assert.match(form, /icon: 'save',[\s\S]*?accessibilityLabel: t\('save'\),[\s\S]*?disabled: true/);
  assert.match(bar, /name=\{editing \? 'close' : 'back'\} round=\{editing\}/);
  assert.match(bar, /borderRadius: theme.radius.pill/);
  assert.match(bar, /width: theme.navigation.editorActionDiameter/);
  assert.match(bar, /borderColor: theme.colors.border/);
  assert.match(bar, /disabled = action.disabled \|\| !action.onPress/);
  assert.match(bar, /disabled=\{disabled\}/);
  assert.match(bar, /<SvgXml\s+xml=\{saveIcon\}/);
  assert.equal(navigationTokens.editorActionDiameter, 36);
  assert.equal(navigationTokens.editorActionIconSize, 20);
  assert.equal(buttonTokens.minimumHeight, 48);
  assert.equal(
    createHash('sha256').update(saveIcon).digest('hex'),
    'e69aaafbec041e88b97abb50b5c83acf5d689099f5aadb6ad36d7154da1683f9',
  );
  assert.match(
    form,
    /<AccountGroupField\s+value=\{groupLabel\}\s+onPress=\{onOpenGroupPicker\}[\s\S]*?<AccountFields/,
  );
  assert.match(
    form,
    /title: t\('chooseAccountGroup'\)[\s\S]*?onDismiss: onCloseGroupPicker[\s\S]*?children: <AccountGroupOptions/,
  );
  assert.match(
    form,
    /<AppBottomSheet\s+visible=\{sheet !== undefined\}\s+animate=\{animateSheet\}\s+avoidKeyboard/,
  );
  assert.doesNotMatch(
    form,
    /ActionButton|accountFormPreview|Entries are discarded|slideInOnMount|showCloseButton/,
  );
  assert.doesNotMatch(form, /choice\?\.open|children: <AccountChoices/);
  assert.match(form, /<AccountDropdown\s+choice=\{choice\}/);
  assert.match(controller, /choice\(\s*'accountLoanDirection'/);
  assert.doesNotMatch(controller, /accountInvestmentType|investmentKinds|investment\.kind/);
  assert.match(controller, /if \(draft\.group !== 'loan'\) return null/);
  assert.match(form, /children: <BankModeEditor/);
  assert.match(form, /onDismiss: \(\) => form.onAction\(\{ type: 'mode.cancel' \}\)/);
  assert.match(picker, /accessibilityLabel=\{t\('accountGroup'\)\}[\s\S]*?accessibilityValue=/);
  assert.match(picker, /minHeight: rowHeight,\s+flexDirection: 'row',\s+alignItems: 'center'/);
  assert.match(picker, /t\('accountGroupFieldLabel'\)/);
  assert.equal(en.accountGroupFieldLabel, 'Group');
  assert.equal(en.accountGroup, 'Account Group');
  assert.match(
    picker,
    /<AppText style=\{\{ flexShrink: 1, textAlign: 'right' \}\}>\{t\(value\)\}<\/AppText>\s*<GroupMark \/>/,
  );
  assert.doesNotMatch(picker, /AccountDropdown|AccountFormIcon/);
  assert.match(picker, /rowHeight = theme.space.xxl/);
  assert.match(picker, /touchInset = \(theme.buttons.minimumHeight - rowHeight\) \/ 2/);
  assert.match(picker, /hitSlop=\{\{ top: touchInset, bottom: touchInset \}\}/);
  assert.match(picker, /accessibilityState=\{\{ disabled: !onSelect, selected \}\}/);
  assert.doesNotMatch(manage, /actions=|onAdd|AppBottomSheet/);
  const choices = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const bankModes = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  assert.doesNotMatch(form, /accountWalletBank|accountWalletProvider/);
  assert.match(form, /label="accountPayFromCaption"/);
  assert.match(form, /accountPayFromCaption/);
  assert.doesNotMatch(form, /accountCollectInto|mode="collect"/);
  assert.match(choices, /checked: selected/);
  assert.match(choices, /m5 12 4 4 10-10/);
  assert.doesNotMatch(form + bankModes, /onSave|onSubmit/);
  assert.doesNotMatch(
    accounts + form + choices + bankModes + picker,
    /expo-router|useState|useEffect|sqlite|\/domain\/|\/data\/|fetch\(/i,
  );
});

test('field info popup prefers start alignment under the tip mark', () => {
  const insets = { top: 32, right: 14, bottom: 24, left: 10 };
  const viewport = { width: 400, height: 730 };
  const fits = popupPosition({ x: 132, y: 280, width: 16, height: 16 }, viewport, insets, {
    margin: 8,
    gap: 4,
    preferredWidth: 240,
    preferredHeight: 120,
    align: 'start',
  });
  assert.equal(fits.width, 240);
  assert.equal(fits.left, 132);
  assert.ok('top' in fits);
  assert.equal(fits.top, 300);
  const inset = popupPosition({ x: 132, y: 280, width: 16, height: 16 }, viewport, insets, {
    margin: 8,
    gap: 4,
    preferredWidth: 160,
    preferredHeight: 120,
    align: 'start',
    alignOffset: 36,
  });
  assert.equal(inset.left, 168);
  const wide = popupPosition({ x: 132, y: 280, width: 16, height: 16 }, viewport, insets, {
    margin: 8,
    gap: 4,
    preferredWidth: 320,
    preferredHeight: 120,
    align: 'start',
  });
  assert.equal(wide.width, 320);
  assert.equal(wide.left, 58);
});

test('date popup stays above the field and fits only complete rows', () => {
  const insets = { top: 32, right: 14, bottom: 24, left: 10 };
  const viewport = { width: 400, height: 730 };
  const settings = {
    margin: 8,
    gap: 4,
    preferredWidth: 316,
    preferredHeight: 174,
    placement: 'above' as const,
  };
  const full = popupPosition({ x: 24, y: 400, width: 350, height: 48 }, viewport, insets, settings);
  assert.ok('bottom' in full);
  assert.equal(full.bottom, 334);
  assert.equal(full.maxHeight, 356);
  assert.equal(fitPopupRows(Math.min(full.maxHeight, 174) - 14, 32, [5, 3, 1]), 5);

  const compact = popupPosition(
    { x: 24, y: 160, width: 350, height: 48 },
    viewport,
    insets,
    settings,
  );
  assert.ok('bottom' in compact);
  assert.equal(compact.bottom, 574);
  assert.equal(compact.maxHeight, 116);
  assert.equal(fitPopupRows(compact.maxHeight - 14, 32, [5, 3, 1]), 3);

  const tight = popupPosition({ x: 24, y: 96, width: 350, height: 48 }, viewport, insets, settings);
  assert.ok('bottom' in tight);
  assert.equal(tight.bottom, 638);
  assert.equal(fitPopupRows(tight.maxHeight - 14, 32, [5, 3, 1]), 1);
  assert.equal(fitPopupRows(31, 32, [5, 3, 1]), 0);
});

test('focused fields scroll only enough to clear the keyboard viewport', () => {
  const viewport = { y: 100, height: 300 };
  assert.equal(focusedFieldScrollOffset({ y: 180, height: 46 }, viewport, 0, 12), 0);
  assert.equal(focusedFieldScrollOffset({ y: 360, height: 46 }, viewport, 80, 12), 98);
  assert.equal(focusedFieldScrollOffset({ y: 90, height: 46 }, viewport, 80, 12), 58);
  assert.equal(focusedFieldScrollOffset({ y: 90, height: 46 }, viewport, 0, 12), 0);
  assert.equal(focusedFieldScrollOffset({ y: 200, height: 260 }, viewport, 80, 12), 152);
  assert.equal(focusedFieldScrollOffset({ y: -20, height: 440 }, viewport, 80, 12), 112);
  assert.equal(focusedFieldScrollOffset({ y: 300, height: 46 }, { y: 100, height: 0 }, 80, 12), 80);
});

test('all Add Account inputs share keyboard-aware viewport and focus bridge', () => {
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const form = readFileSync('src/shared/ui/app-keyboard-form.tsx', 'utf8');
  const field = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');
  assert.match(screen, /<AppKeyboardForm>[\s\S]*?<AccountFields/);
  assert.match(form, /<KeyboardAvoidingView/);
  assert.match(form, /onLayout=\{reveal\}/);
  assert.match(form, /automaticallyAdjustKeyboardInsets=\{false\}/);
  assert.match(form, /keyboardDidShow/);
  assert.match(form, /focusedFieldScrollOffset\(/);
  assert.match(form, /focused\.current !== input/);
  assert.match(form, /cancelAnimationFrame/);
  assert.match(field, /focusBridge\?\.focus\(input\.current\)/);
  assert.match(field, /focusBridge\?\.blur\(input\.current\)/);
  assert.match(field, /focusBridge\?\.resize\(input\.current\)/);
});

test('option popups share a controlled chevron and date rows omit it', () => {
  const dropdown = readFileSync('src/features/accounts/account-option-popup.tsx', 'utf8');
  const dateField = readFileSync('src/shared/ui/app-date-field.tsx', 'utf8');
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const chevron = readFileSync('src/shared/ui/app-popup-chevron.tsx', 'utf8');
  assert.match(dropdown, /<AppPopupChevron open=\{open\} \/>/);
  assert.doesNotMatch(dateField, /AppPopupChevron/);
  assert.doesNotMatch(controls, /expand:/);
  assert.match(chevron, /d="m9 6 6 6-6 6"/);
  assert.match(chevron, /outputRange: \['0deg', '90deg'\]/);
  assert.match(chevron, /toValue: target/);
  assert.match(chevron, /useReducedMotion\(\)/);
  assert.match(chevron, /theme\.optionPopup\.chevronDurationMs/);
  assert.match(chevron, /theme\.iconRoles\.textField/);
  assert.match(chevron, /return \(\) => animation\.stop\(\)/);
  assert.match(chevron, /pointerEvents="none"/);
});

test('option popup anchors beside the trigger and stays within the safe viewport', () => {
  const insets = { top: 32, right: 14, bottom: 24, left: 10 };
  const settings = { margin: 8, gap: 4, preferredWidth: 240, preferredHeight: 300 };
  const viewport = { width: 400, height: 730 };
  assert.deepEqual(
    accountPopupPosition({ x: 24, y: 96, width: 350, height: 48 }, viewport, insets, settings),
    { left: 134, width: 240, top: 148, maxHeight: 550 },
  );
  assert.deepEqual(
    accountPopupPosition({ x: 12, y: 540, width: 80, height: 48 }, viewport, insets, settings),
    { left: 18, width: 240, bottom: 194, maxHeight: 496 },
  );
  assert.deepEqual(
    accountPopupPosition(
      { x: 0, y: 100, width: 250, height: 48 },
      { width: 222, height: 240 },
      insets,
      settings,
    ),
    { left: 18, width: 182, top: 152, maxHeight: 56 },
  );

  const popup = readFileSync('src/features/accounts/account-option-popup.tsx', 'utf8');
  assert.match(popup, /accessibilityState=\{\{ expanded: open \}\}/);
  assert.match(popup, /measureInWindow/);
  assert.match(popup, /<Modal\s+transparent[\s\S]*?onRequestClose=\{onClose\}/);
  assert.match(popup, /accessibilityLabel=\{t\('closeAccountOptions'\)\}\s+onPress=\{onClose\}/);
  assert.match(popup, /<ScrollView[\s\S]*?<AccountChoices label=\{label\} options=\{options\}/);
  assert.doesNotMatch(popup, /AppBottomSheet|expo-router|useEffect|sqlite|fetch\(/i);
});

test('payment account picker groups eligible choices and resolves the selected stable ID', () => {
  const picker: AccountPickerModel = {
    accounts: [
      { id: 'bank-test', name: 'Test bank', group: 'bank' },
      { id: 'cash-test', name: 'Test cash', group: 'cash' },
    ],
    selectedId: 'bank-test',
    open: true,
    onOpen: () => {},
    onClose: () => {},
    onSelect: () => {},
  };
  assert.deepEqual(
    accountPickerGroups(picker.accounts).map(({ group }) => group),
    ['cash', 'bank'],
  );
  assert.equal(selectedAccountName(picker), 'Test bank');
  assert.equal(selectedAccountName({ ...picker, selectedId: 'cash-test' }), 'Test cash');
  assert.equal(selectedAccountName({ ...picker, selectedId: 'missing' }), null);
  assert.equal(selectedAccountName(null), null);
  assert.equal(accountPickerVisible(picker), true);
  assert.equal(accountPickerVisible({ ...picker, open: false }), false);
  assert.equal(accountPickerVisible({ ...picker, accounts: [] }), false);
  assert.equal(accountPickerVisible(null), false);
  assert.deepEqual(accountPickerGroups([]), []);
  assert.equal(accountPickerGroups(picker.accounts.slice(0, 1)).length, 1);
});

test('credit card payment uses the existing sheet shell and no runtime fixture accounts', () => {
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const controller = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  const picker = readFileSync('src/features/accounts/account-picker-bottom-sheet.tsx', 'utf8');
  assert.match(controller, /paymentSource: null/);
  assert.match(screen, /accountPickerBottomSheetLayer\(form\.paymentSource\)/);
  assert.match(screen, /picker\.accounts\.length === 0/);
  assert.match(screen, /onPress=\{picker\.onOpen\}/);
  assert.match(picker, /accountPickerVisible\(picker\)/);
  assert.match(picker, /picker\.onSelect\(account\.id\)/);
  assert.match(picker, /checked: selected/);
  assert.match(picker, /onDismiss: picker\.onClose/);
  assert.doesNotMatch(picker, /<Modal|<ScrollView|useState|fetch\(/);
});
