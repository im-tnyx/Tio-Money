import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  accountCurrencyChoices,
  draftCurrencies,
  isPreviewGroup,
  newAccountDraft,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountDraft,
  type AccountFormAction,
  type DraftField,
  type PreviewGroup,
} from '../../src/features/accounts/account-form-contract';
import { beginPickerClose, finishPickerClose } from '../../src/features/accounts/account-picker';
import { BUILT_IN_ACCOUNT_GROUPS } from '../../src/features/settings/account-group-templates';
import { en } from '../../src/shared/i18n/strings';

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

test('the picker accepts one choice before native dismissal and a later Cancel cannot replace it', () => {
  const first = beginPickerClose({ phase: 'open' }, 'bank');
  assert.deepEqual(first, { phase: 'closing', group: 'bank' });
  assert.equal(beginPickerClose(first, 'cash'), first);
  assert.equal(beginPickerClose(first, null), first);
  const routing = finishPickerClose(first);
  assert.deepEqual(routing, { phase: 'routing' });
  assert.equal(finishPickerClose(routing), routing);
  assert.equal(beginPickerClose(routing, 'loan'), routing);
  assert.deepEqual(finishPickerClose(beginPickerClose({ phase: 'open' }, null)), { phase: 'idle' });
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
  const route = readFileSync('src/features/accounts/add-account-route.tsx', 'utf8');
  assert.match(route, /setEdit\(\(previous\) =>/);
  assert.match(
    route,
    /showWalletFunding: draft.group === 'wallet' && draft.walletKind === 'funded'/,
  );
});

test('Bank mode drafts add, edit, cancel and remove using the newest actions and stable row IDs', () => {
  const bank = replay('bank', [
    { type: 'text', field: 'bankName', value: 'Bank' },
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
  assert.equal(bank.fields.bankName, 'Bank');
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
  assert.deepEqual(edited.modes, [{ id: 1, name: 'Edited', kind: 'internetBanking' }]);
  assert.equal(edited.modeEditor, null);
  const cash = newAccountDraft('cash', 'INR');
  assert.equal(updateAccountDraft(cash, { type: 'mode.open' }, currencies), cash);
  assert.equal(
    updateAccountDraft(cash, { type: 'text', field: 'creditLimit', value: '123' }, currencies),
    cash,
  );
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
  assert.match(screen, /\{currencyChoices \? \([\s\S]*?label="currency"[\s\S]*?\) : null\}/);
  assert.doesNotMatch(screen, /subCodes|useCurrencySettings/);
});

test('currency changes clear each group’s amounts while retaining all other draft data', () => {
  const monetaryFields = {
    cash: ['openingAmount'],
    bank: ['openingAmount'],
    'credit-card': ['outstanding', 'creditLimit'],
    wallet: ['openingAmount'],
    loan: ['originalPrincipal', 'outstandingPrincipal'],
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

  const route = readFileSync('src/features/accounts/add-account-route.tsx', 'utf8');
  assert.match(route, /if \(draft !== edit\) setEdit\(draft\)/);
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

test('group fields render from the correct typed draft and Card keeps unavailable Auto Pay controls', () => {
  const expectedFields = {
    cash: ['openingAmount'],
    bank: ['bankName', 'openingAmount'],
    'credit-card': ['outstanding', 'creditLimit', 'statementDate', 'dueDate'],
    wallet: ['provider', 'openingAmount'],
    loan: ['originalPrincipal', 'outstandingPrincipal', 'startDate', 'nextDueDate'],
    investment: ['investedCost', 'valuation', 'valuationDate'],
  } satisfies Record<PreviewGroup, readonly string[]>;
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const groupFields = screen.slice(screen.indexOf('function GroupFields'));
  assert.match(screen, /field="name"[\s\S]*?accountCardName/);
  assert.match(screen, /field="description"/);
  assert.match(screen, /draft.group === 'bank' \? <BankPaymentModes/);
  for (const { id } of BUILT_IN_ACCOUNT_GROUPS) {
    if (!isPreviewGroup(id)) continue;
    const [section] = groupFields.split("case '" + id + "':")[1]?.split(/case '/) ?? [];
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
  assert.equal(en.accountCardStatementDate, 'Statement Date');
  assert.equal(en.accountPayFrom, 'Pay From Account');
  assert.match(en.accountWalletBankUnavailable, /inherits the Bank account’s currency/);
  assert.equal(en.accountCardCreditLimit, 'Total Credit Limit');
  assert.equal(en.accountCardDueDate, 'Due Date');
  assert.equal(en.accountAutoPay, 'Auto Pay');
  assert.match(en.accountAutoPayUnavailable, /Tracking only.*never debits/);
  const autoPay = screen.match(/<AccountChoices\s+label="accountAutoPay"[\s\S]*?\/>/)?.[0];
  assert.ok(autoPay);
  assert.doesNotMatch(autoPay, /onChange|value=\{/);
  const choices = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  assert.match(choices, /<AppTextField accessibilityLabel=\{t\(label\)\}/);
  assert.match(choices, /accessibilityRole="radiogroup"\s+accessibilityLabel=\{t\(label\)\}/);
  assert.match(choices, /accessibilityRole="radio"/);
  assert.match(choices, /accessibilityState=\{\{ checked: selected, disabled: !onChange \}\}/);
  assert.match(choices, /disabled=\{!onChange\}/);
});

test('settings routes are distinct and detail routes inherit shared theme motion', () => {
  const more = readFileSync('src/features/settings/use-more-view-model.ts', 'utf8');
  const stack = readFileSync('src/app/_layout.tsx', 'utf8');
  assert.match(more, /case 'account\.groups\.open':\s+router\.push\('\/account-groups'\)/);
  assert.match(more, /case 'account\.manage\.open':\s+router\.push\('\/manage-accounts'\)/);
  assert.match(stack, /name="add-account\/\[group\]" options=\{motion\.detail\}/);
  assert.match(stack, /name="manage-accounts" options=\{motion\.detail\}/);
  assert.match(stack, /contentStyle: \{ backgroundColor: theme\.colors\.canvas \}/);
});

test('account screens forward presentation callbacks with disabled Save and no Manage add action', () => {
  const accounts = readFileSync('src/features/accounts/accounts-screen.tsx', 'utf8');
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const manage = accounts.slice(accounts.indexOf('export function ManageAccountsScreen'));
  assert.match(accounts, /icon: 'add'.*onPress: onAdd/);
  assert.match(accounts, /<AppBottomSheet/);
  assert.match(accounts, /disabled=\{!onSelect\}/);
  assert.doesNotMatch(manage, /actions=|onAdd|AppBottomSheet/);
  const choices = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const bankModes = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  assert.match(form, /<ActionButton label=\{t\('save'\)\} disabled \/>/);
  assert.match(form, /accountSaveUnavailable/);
  assert.match(form, /label="accountWalletBank"/);
  assert.match(form, /label="accountPayFrom"/);
  assert.match(choices, /checked: selected/);
  assert.match(choices, /m5 12 4 4 10-10/);
  assert.match(bankModes, /avoidKeyboard/);
  assert.doesNotMatch(form + bankModes, /onSave|onSubmit/);
  assert.doesNotMatch(
    accounts + form + choices + bankModes,
    /expo-router|useState|useEffect|sqlite|\/domain\/|\/data\/|fetch\(/i,
  );
});
