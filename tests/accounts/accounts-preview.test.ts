import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  draftCurrencies,
  isPreviewGroup,
  newAccountDraft,
  updateAccountDraft,
} from '../../src/features/accounts/account-form-contract';
import { BUILT_IN_ACCOUNT_GROUPS } from '../../src/features/settings/account-group-templates';

test('only approved preview templates can open a form', () => {
  assert.deepEqual(BUILT_IN_ACCOUNT_GROUPS.map(({ id }) => id).filter(isPreviewGroup), [
    'cash',
    'bank',
  ]);
  for (const invalid of ['custom', ['cash'], {}, undefined])
    assert.equal(isPreviewGroup(invalid), false);
});

test('bank flags and bank name are isolated to the Bank draft and do not mutate the source', () => {
  const cash = newAccountDraft('cash', 'INR');
  const bank = newAccountDraft('bank', 'INR');
  const capability = { type: 'capability', capability: 'upi', value: true } as const;
  const bankName = { type: 'text', field: 'bankName', value: 'Bank' } as const;

  assert.equal(updateAccountDraft(cash, capability, ['INR']), cash);
  assert.equal(updateAccountDraft(cash, bankName, ['INR']), cash);
  assert.equal(bank.group, 'bank');
  if (bank.group !== 'bank') assert.fail('expected a bank draft');
  const updated = updateAccountDraft(updateAccountDraft(bank, capability, ['INR']), bankName, [
    'INR',
  ]);
  assert.deepEqual(updated, {
    ...bank,
    bankName: 'Bank',
    capabilities: { ...bank.capabilities, upi: true },
  });
  assert.equal(bank.capabilities.upi, false);
  assert.equal(newAccountDraft('bank', 'INR').name, '');
});

test('currency choices use Main/Sub preferences and never relabel a typed amount', () => {
  const choices = draftCurrencies({ mainCode: 'INR', subCodes: ['USD', 'JPY'] });
  assert.deepEqual(choices, ['INR', 'USD', 'JPY']);
  const draft = updateAccountDraft(
    newAccountDraft('cash', 'INR'),
    {
      type: 'text',
      field: 'openingAmount',
      value: '123.45',
    },
    choices,
  );
  assert.equal(updateAccountDraft(draft, { type: 'currency', value: 'EUR' }, choices), draft);
  assert.equal(updateAccountDraft(draft, { type: 'currency', value: 'INR' }, choices), draft);
  assert.deepEqual(updateAccountDraft(draft, { type: 'currency', value: 'JPY' }, choices), {
    ...draft,
    currency: 'JPY',
    openingAmount: '',
  });
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

test('account screens forward presentation callbacks without a Save or a Manage add action', () => {
  const accounts = readFileSync('src/features/accounts/accounts-screen.tsx', 'utf8');
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const manage = accounts.slice(accounts.indexOf('export function ManageAccountsScreen'));
  assert.match(accounts, /icon: 'add'.*onPress: onAdd/);
  assert.match(accounts, /<AppBottomSheet/);
  assert.match(accounts, /disabled=\{!onSelect\}/);
  assert.doesNotMatch(manage, /actions=|onAdd|AppBottomSheet/);
  assert.doesNotMatch(form, /onSave|onSubmit|ActionButton/);
  assert.doesNotMatch(
    accounts + form,
    /expo-router|useState|useEffect|sqlite|\/domain\/|\/data\/|fetch\(/i,
  );
});
