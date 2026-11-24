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
  calendarDateParts,
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
import { accountPopupPosition } from '../../src/features/accounts/account-popup-position';
import { BUILT_IN_ACCOUNT_GROUPS } from '../../src/features/settings/account-group-templates';
import paymentModeIcons from '../../src/shared/assets/google-material-icons/payment-mode-icons.json';
import saveIcon from '../../src/shared/assets/google-material-icons/save-icon.json';
import { en } from '../../src/shared/i18n/strings';
import {
  buttonTokens,
  navigationTokens,
  textFieldTokens,
} from '../../src/shared/theme/component-tokens';
import { space } from '../../src/shared/theme/tokens';

const currencies = draftCurrencies({ mainCode: 'INR', subCodes: ['USD', 'JPY'] });

function replay(group: PreviewGroup, actions: readonly AccountFormAction[]) {
  return actions.reduce(
    (draft, action) => updateAccountDraft(draft, action, currencies),
    newAccountDraft(group, 'INR'),
  );
}

test('six approved group templates open a form; Insurance and custom IDs do not', () => {
  assert.deepEqual(BUILT_IN_ACCOUNT_GROUPS.map(({ id }) => id).filter(isPreviewGroup), [
    'cash',
    'bank',
    'credit-card',
    'loan',
    'investment',
    'wallet',
  ]);
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

test('the three account dropdowns preserve drafts on dismiss and close after one selection', () => {
  const cases = [
    { group: 'loan', field: 'direction', choice: { type: 'loan.direction', value: 'given' } },
    {
      group: 'wallet',
      field: 'walletKind',
      choice: { type: 'wallet.kind', value: 'bank-linked' },
    },
    {
      group: 'investment',
      field: 'investmentKind',
      choice: { type: 'investment.kind', value: 'fixedDeposit' },
    },
  ] as const;
  const initial = newAccountAddSession(true);
  const bank = updateSession(initial, { type: 'group.select', group: 'bank' });
  assert.equal(updateSession(bank, { type: 'options.open' }), bank);

  for (const { group, field, choice } of cases) {
    const form = updateSession(initial, { type: 'group.select', group });
    const named = updateSession(form, {
      type: 'form',
      group,
      action: { type: 'text', field: 'name', value: 'Keep this edit' },
    });
    const open = updateSession(named, { type: 'options.open' });
    assert.equal(open.choicePickerOpen, true);
    assert.equal(updateSession(open, { type: 'group.open' }), open);
    const wrongChoice = group === 'loan' ? cases[1].choice : cases[0].choice;
    assert.equal(updateSession(open, { type: 'options.select', choice: wrongChoice }), open);

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
      group,
    });
    const draft = reopened.drafts[group];
    assert.ok(draft && field in draft);
    assert.equal(Reflect.get(draft, field), choice.value);
    assert.equal(draft.fields.name, 'Keep this edit');
  }
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

test('batched text inputs and Wallet kind toggles use the latest draft without losing funded details', () => {
  const draft = replay('wallet', [
    { type: 'text', field: 'name', value: 'Weekend' },
    { type: 'text', field: 'openingAmount', value: '123.45' },
    { type: 'wallet.kind', value: 'bank-linked' },
    { type: 'text', field: 'provider', value: 'Provider' },
    { type: 'wallet.kind', value: 'funded' },
    { type: 'text', field: 'description', value: 'Cash reserve' },
  ]);
  assert.equal(draft.group, 'wallet');
  if (draft.group !== 'wallet') assert.fail();
  assert.equal(draft.walletKind, 'funded');
  assert.deepEqual(draft.fields, {
    name: 'Weekend',
    openingAmount: '123.45',
    provider: 'Provider',
    description: 'Cash reserve',
  });
  assert.equal(newAccountDraft('wallet', 'INR').fields.name, '');
  const route = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  assert.match(route, /setSession\(\(previous\) =>/);
  assert.match(
    route,
    /showWalletFunding: draft.group === 'wallet' && draft.walletKind === 'funded'/,
  );
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
    { type: 'text', field: 'valuation', value: '150.54' },
    { type: 'text', field: 'valuationDate', value: '2026-11-23' },
    { type: 'investment.kind', value: 'gold' },
  ]);
  assert.equal(updateAccountDraft(draft, { type: 'currency', value: 'EUR' }, currencies), draft);
  assert.equal(updateAccountDraft(draft, { type: 'currency', value: 'INR' }, currencies), draft);
  const changed = updateAccountDraft(draft, { type: 'currency', value: 'JPY' }, currencies);
  assert.equal(changed.currency, 'JPY');
  assert.deepEqual(changed.fields, { ...draft.fields, investedCost: '', valuation: '' });
});

test('every eligible form defaults to Main and only shows currency choices with configured Subs', () => {
  const mainOnly = draftCurrencies({ mainCode: 'INR', subCodes: [] });
  for (const { id } of BUILT_IN_ACCOUNT_GROUPS) {
    if (!isPreviewGroup(id)) continue;
    const draft = newAccountDraft(id, 'INR');
    assert.equal(draft.currency, 'INR', id);
    assert.equal(accountCurrencyChoices(draft, mainOnly), null, id);
    assert.deepEqual(accountCurrencyChoices(draft, currencies), ['INR', 'USD', 'JPY'], id);
  }
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const route = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  assert.match(route, /currencyChoices:\s*accountCurrencyChoices\(draft, currencies\)\?\.map/);
  assert.match(
    screen,
    /const showCurrency = 'currencyControl' in spec && currencyChoices !== null/,
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
  const card = screen.slice(
    screen.indexOf("case 'credit-card':"),
    screen.indexOf("case 'wallet':"),
  );

  const controllingFields = [...specs.matchAll(/(\w+): \{[^}]*?currencyControl: true/g)].map(
    ([, field]) => field,
  );
  assert.deepEqual(controllingFields, [
    'openingAmount',
    'creditLimit',
    'outstandingPrincipal',
    'investedCost',
  ]);
  assert.match(card, /field="outstanding"[^>]*?\{\.\.\.inputProps\}/);
  assert.match(card, /field="creditLimit"[^>]*?\{\.\.\.inputProps\}/);
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
    assert.deepEqual(accountCurrencyChoices(draft, currencies), ['INR', 'USD', 'JPY']);
  }
});

test('currency changes clear each group’s amounts while retaining all other draft data', () => {
  const monetaryFields = {
    cash: ['openingAmount'],
    bank: ['openingAmount'],
    'credit-card': ['outstanding', 'creditLimit'],
    wallet: ['openingAmount'],
    loan: ['originalPrincipal', 'outstandingPrincipal', 'emiAmount'],
    investment: ['investedCost', 'valuation'],
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
    assert.equal(accountCurrencyChoices(reconciled, mainOnly), null, id);

    const readded = draftCurrencies({ mainCode: 'JPY', subCodes: ['USD'] });
    assert.equal(reconcileAccountDraftCurrency(reconciled, 'JPY', readded), reconciled, id);
    assert.deepEqual(accountCurrencyChoices(reconciled, readded), ['JPY', 'USD'], id);
  }

  const route = readFileSync('src/features/accounts/use-add-account-view-model.ts', 'utf8');
  assert.match(route, /if \(current !== session\) setSession\(current\)/);
});

test('a Bank-linked Wallet has no currency choice and retains the funded draft when toggled back', () => {
  const funded = replay('wallet', [
    { type: 'currency', value: 'USD' },
    { type: 'text', field: 'openingAmount', value: '13.50' },
  ]);
  const linked = updateAccountDraft(
    funded,
    { type: 'wallet.kind', value: 'bank-linked' },
    currencies,
  );
  assert.equal(accountCurrencyChoices(linked, currencies), null);
  assert.equal(updateAccountDraft(linked, { type: 'currency', value: 'JPY' }, currencies), linked);
  assert.deepEqual(
    updateAccountDraft(linked, { type: 'wallet.kind', value: 'funded' }, currencies),
    funded,
  );
});

test('group fields render typed drafts and Card and Loan share unavailable payment controls', () => {
  const expectedFields = {
    cash: ['openingAmount'],
    bank: ['openingAmount'],
    'credit-card': ['outstanding', 'creditLimit', 'statementDate', 'dueDate'],
    wallet: ['provider', 'openingAmount'],
    loan: ['originalPrincipal', 'outstandingPrincipal', 'emiAmount', 'startDate', 'nextDueDate'],
    investment: ['investedCost', 'valuation', 'valuationDate'],
  } satisfies Record<PreviewGroup, readonly string[]>;
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const groupFields = screen.slice(screen.indexOf('function GroupFields'));
  assert.equal(screen.match(/field="name"/g)?.length, 1);
  assert.match(screen, /field="name"[\s\S]*?accountCardName/);
  assert.match(screen, /field="description"/);
  assert.match(screen, /draft.group === 'bank' \? \(\s*<BankPaymentModes/);
  assert.match(groupFields, /case 'cash':\s*case 'bank':/);
  for (const { id } of BUILT_IN_ACCOUNT_GROUPS) {
    if (!isPreviewGroup(id)) continue;
    const sectionGroup = id === 'cash' ? 'bank' : id;
    const [section] = groupFields.split("case '" + sectionGroup + "':")[1]?.split(/case '/) ?? [];
    assert.ok(section, id);
    const rendered = [...section.matchAll(/<DraftInput\s+field="([^"]+)"/g)].map(
      (match) => match[1],
    );
    assert.deepEqual(rendered, expectedFields[id], id);
    assert.deepEqual(
      Object.keys(newAccountDraft(id, 'INR').fields).sort(),
      [...expectedFields[id], 'name', 'description'].sort(),
    );
  }
  assert.equal(en.accountName, 'Account Name');
  assert.equal(en.accountCardName, 'Card Name');
  assert.equal(en.accountCardOutstanding, 'Opening Outstanding');
  assert.equal(en.accountCardStatementDate, 'Billing Cycle Start Date');
  assert.equal(en.accountPayFrom, 'Payment From');
  assert.equal(en.accountPayFromCaption, 'From');
  assert.equal(en.accountPayFromPlaceholder, 'Payment');
  assert.match(
    screen,
    /<AccountField\s+label="accountPayFromCaption"\s+appearance="borderless"\s+textSize="title"/,
  );
  const paymentField = screen.slice(
    screen.indexOf('function PaymentFromField'),
    screen.indexOf('function GroupFields'),
  );
  assert.equal(screen.match(/<PaymentFromField \/>/g)?.length, 2);
  assert.match(groupFields, /field="creditLimit"[^>]*\/>\s*<PaymentFromField \/>/);
  assert.match(groupFields, /<PaymentFromField \/>\s*<DraftInput field="statementDate"/);
  assert.match(groupFields, /field="emiAmount"[^>]*\/>\s*<PaymentFromField \/>/);
  assert.match(groupFields, /<PaymentFromField \/>\s*<DraftInput field="startDate"/);
  const investmentSection = groupFields.slice(groupFields.indexOf("case 'investment':"));
  assert.doesNotMatch(investmentSection, /PaymentFromField|accountAutoPay/);
  assert.match(paymentField, /placeholder=\{t\('accountPayFromPlaceholder'\)\}/);
  assert.match(paymentField, /accessibilityLabel=\{t\('accountPayFrom'\)\}/);
  assert.match(paymentField, /accessibilityState=\{\{ disabled: true \}\}/);
  assert.match(paymentField, /editable=\{false\}\s+value=""/);
  assert.doesNotMatch(paymentField, /labelAsPlaceholder|trailing=|onChangeText/);
  assert.doesNotMatch(groupFields, /accountPayFromUnavailable/);
  assert.match(en.accountWalletBankUnavailable, /inherits the Bank account’s currency/);
  assert.equal(en.accountCardCreditLimit, 'Total Credit Limit');
  assert.equal(en.accountCardDueDate, 'Payment Due Date');
  assert.equal(en.accountAutoPay, 'Auto Pay');
  assert.match(en.accountAutoPayUnavailable, /Tracking only.*never debits/);
  assert.match(
    screen,
    /field="description"[^>]*?\/>\s*\{draft.group === 'credit-card' \|\| draft.group === 'loan' \? \(\s*<AccountFormRow label="accountAutoPay"[^>]*>[\s\S]*?<Switch/,
  );
  assert.equal(screen.match(/<Switch\s/g)?.length, 1);
  const autoPay = screen.match(/<Switch\s[\s\S]*?\/>/)?.[0];
  assert.ok(autoPay);
  assert.match(autoPay, /accessibilityHint=\{t\('accountAutoPayUnavailable'\)\}/);
  assert.match(autoPay, /value=\{false\}\s+disabled\s*\/>/);
  assert.doesNotMatch(autoPay, /onValueChange|onChange|onPress/);
  assert.doesNotMatch(groupFields, /accountAutoPay|accountTracking/);
  const choices = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  assert.match(choices, /<AppTextField\s+accessibilityLabel=\{t\(label\)\}/);
  assert.match(choices, /accessibilityRole="radiogroup"\s+accessibilityLabel=\{t\(label\)\}/);
  assert.match(choices, /accessibilityRole="radio"/);
  assert.match(choices, /accessibilityState=\{\{ checked: selected, disabled \}\}/);
  assert.match(choices, /disabled=\{disabled\}/);
});

test('Credit Card dates edit monthly days and Loan and Investment dates keep their full values', () => {
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

  const loan = replay('loan', [{ type: 'text', field: 'startDate', value: '2026-11-24' }]);
  const investment = replay('investment', [
    { type: 'text', field: 'valuationDate', value: '2026-11-24' },
  ]);
  assert.ok(loan.group === 'loan' && investment.group === 'investment');
  assert.equal(loan.fields.startDate, '2026-11-24');
  assert.equal(investment.fields.valuationDate, '2026-11-24');

  assert.equal(en.accountCardMonthlySuffix, 'of every month');
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  assert.deepEqual(
    [...form.matchAll(/(\w+): \{ label: '[^']+', date: true, monthly: true \}/g)].map(
      (match) => match[1],
    ),
    ['statementDate', 'dueDate'],
  );
  assert.match(form, /suffix=\{\s*monthly \? \([\s\S]*?accountCardMonthlySuffix/);
  assert.match(form, /keyboardType=\{date \? 'number-pad'/);
});

test('Loan and Investment edit the day, month and year independently on the same date row', () => {
  const forms = [
    { group: 'loan', field: 'startDate' },
    { group: 'loan', field: 'nextDueDate' },
    { group: 'investment', field: 'valuationDate' },
  ] as const;

  for (const { group, field } of forms) {
    const draft = replay(group, [
      { type: 'date.part', field, part: 'day', value: '24' },
      { type: 'date.part', field, part: 'year', value: '2026' },
      { type: 'date.part', field, part: 'month', value: '11' },
      { type: 'currency', value: 'USD' },
    ]);
    assert.ok(field in draft.fields);
    assert.equal(Reflect.get(draft.fields, field), '2026-11-24');
    assert.deepEqual(calendarDateParts(Reflect.get(draft.fields, field)), {
      day: '24',
      month: '11',
      year: '2026',
    });
    assert.equal(
      updateAccountDraft(
        draft,
        { type: 'date.part', field, part: 'month', value: '13' },
        currencies,
      ),
      draft,
    );
    const cleared = updateAccountDraft(
      draft,
      { type: 'date.part', field, part: 'day', value: '' },
      currencies,
    );
    assert.equal(Reflect.get(cleared.fields, field), '2026-11-');
  }

  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  assert.match(
    form,
    /<CalendarDateMonthAndYear[\s\S]*?type: 'date.part', field, part: 'month'[\s\S]*?type: 'date.part', field, part: 'year'/,
  );
  assert.match(form, /value=\{parts\?\.day \?\? value\}/);
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
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const bankModes = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  const input = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');
  const row = controls.slice(
    controls.indexOf('export function AccountFormRow'),
    controls.indexOf('export function AccountField'),
  );

  assert.match(
    form,
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
    /labelAsPlaceholder \? null : \([\s\S]*?<AppText[\s\S]*?variant="caption"\s+muted[\s\S]*?marginStart: iconWidth \+ columnGap[\s\S]*?\{t\(label\)\}[\s\S]*?flexDirection: 'row'/,
  );
  assert.match(
    field,
    /alignItems: props.multiline \? 'flex-start' : 'center'[\s\S]*?\{leading\}\s*<\/View>\s*\{suffix \? \([\s\S]*?\{input\}<\/View>\s*\)\}\s*\{trailing\}/,
  );
  assert.match(controls, /d=\{rowIcons\[name\]\}[\s\S]*?theme\.colors\.primaryText/);
  assert.match(form, /textSize=\{field === 'name' \|\| money \|\| date \? 'title' : 'section'\}/);
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
  assert.match(form, /placeholder=\{calendar \? t\('accountDateDayPlaceholder'\) : money \? '0'/);
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
  assert.match(
    controller,
    /choice\(\s*'accountWalletKind',[\s\S]*?choice\(\s*'accountLoanDirection',[\s\S]*?choice\(\s*'accountInvestmentType'/,
  );
  assert.match(form, /children: <BankModeEditor/);
  assert.match(form, /onDismiss: \(\) => form.onAction\(\{ type: 'mode.cancel' \}\)/);
  assert.match(picker, /accessibilityLabel=\{t\('accountGroup'\)\}[\s\S]*?accessibilityValue=/);
  assert.match(picker, /minHeight: rowHeight,\s+flexDirection: 'row',\s+alignItems: 'center'/);
  assert.match(picker, /<AppText muted style=\{\{ flex: 1 \}\}>\s*\{t\('accountGroup'\)\}/);
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
  assert.match(form, /label="accountWalletBank"/);
  assert.match(form, /label="accountPayFromCaption"/);
  assert.match(choices, /checked: selected/);
  assert.match(choices, /m5 12 4 4 10-10/);
  assert.doesNotMatch(form + bankModes, /onSave|onSubmit/);
  assert.doesNotMatch(
    accounts + form + choices + bankModes + picker,
    /expo-router|useState|useEffect|sqlite|\/domain\/|\/data\/|fetch\(/i,
  );
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
