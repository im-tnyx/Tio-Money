import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  accountCurrencyChoices,
  draftCurrencies,
  isPreviewGroup,
  newAccountDraft,
  paymentModeTypes,
  reconcileAccountDraftCurrency,
  updateAccountDraft,
  type AccountDraft,
  type AccountFormAction,
  type DraftField,
  type PreviewGroup,
} from '../../src/features/accounts/account-form-contract';
import { beginPickerClose, finishPickerClose } from '../../src/features/accounts/account-picker';
import { BUILT_IN_ACCOUNT_GROUPS } from '../../src/features/settings/account-group-templates';
import paymentModeIcons from '../../src/shared/assets/google-material-icons/payment-mode-icons.json';
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

test('linked payment modes show a compact header action and named icon rows with stable controls', () => {
  const source = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  const list = source.slice(
    source.indexOf('export function BankPaymentModes'),
    source.indexOf('export function BankModeEditor'),
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
  const route = readFileSync('src/features/accounts/add-account-route.tsx', 'utf8');
  assert.match(route, /currencyChoices:\s*accountCurrencyChoices\(draft, currencies\)\?\.map/);
  assert.match(
    screen,
    /const showCurrency = 'currencyControl' in spec && currencyChoices !== null/,
  );
  assert.doesNotMatch(screen, /subCodes|useCurrencySettings/);
});

test('one amount row per form carries the inline currency selector and all amounts share its code', () => {
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const route = readFileSync('src/features/accounts/add-account-route.tsx', 'utf8');
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
  assert.match(screen, /hint=\{showCurrency \? t\('accountCurrencyChangeHint'\)/);
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

  assert.match(controls, /<View style=\{\{ flex: 1 \}\}>\{input\}<\/View>\s+\{trailing\}/);
  assert.match(choices, /<ScrollView\s+horizontal\s+keyboardShouldPersistTaps="handled"/);
  assert.match(choices, /maxWidth: '50%'/);
  assert.match(choices, /options\.map\(\(option\) =>/);
  assert.match(choices, /accessibilityState=\{\{ checked: selected \}\}/);
  assert.match(choices, /const selected = option.value === value/);
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
    bank: ['openingAmount'],
    'credit-card': ['outstanding', 'creditLimit', 'statementDate', 'dueDate'],
    wallet: ['provider', 'openingAmount'],
    loan: ['originalPrincipal', 'outstandingPrincipal', 'startDate', 'nextDueDate'],
    investment: ['investedCost', 'valuation', 'valuationDate'],
  } satisfies Record<PreviewGroup, readonly string[]>;
  const screen = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const groupFields = screen.slice(screen.indexOf('function GroupFields'));
  assert.equal(screen.match(/field="name"/g)?.length, 1);
  assert.match(screen, /field="name"[\s\S]*?accountCardName/);
  assert.match(screen, /field="description"/);
  assert.match(screen, /draft.group === 'bank' \? <BankPaymentModes/);
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
  assert.equal(en.accountCardStatementDate, 'Statement Date');
  assert.equal(en.accountPayFrom, 'Payment');
  assert.match(en.accountWalletBankUnavailable, /inherits the Bank account’s currency/);
  assert.equal(en.accountCardCreditLimit, 'Total Credit Limit');
  assert.equal(en.accountCardDueDate, 'Due Date');
  assert.equal(en.accountAutoPay, 'Auto Pay');
  assert.match(en.accountAutoPayUnavailable, /Tracking only.*never debits/);
  assert.match(
    screen,
    /field="description"[^>]*?\/>\s*\{draft.group === 'credit-card' \? \([\s\S]*?\{t\('accountAutoPay'\)\}[\s\S]*?<Switch/,
  );
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
  assert.match(choices, /accessibilityState=\{\{ checked: selected, disabled: !onChange \}\}/);
  assert.match(choices, /disabled=\{!onChange\}/);
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
  assert.match(field, /underlineColorAndroid=\{borderless \? 'transparent'/);
});

test('main form aligns icons and wraps Description from one line with its label inside', () => {
  const form = readFileSync('src/features/accounts/add-account-screen.tsx', 'utf8');
  const route = readFileSync('src/features/accounts/add-account-route.tsx', 'utf8');
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const bankModes = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');

  const input = readFileSync('src/shared/ui/app-text-field.tsx', 'utf8');

  assert.match(form, /const description = field === 'description'/);
  assert.match(form, /textSize=\{field === 'name' \|\| money \|\| date \? 'title' : 'section'\}/);
  assert.match(form, /d=\{inputIcons\[icon\]\}[\s\S]*?stroke=\{theme\.colors\.primaryText\}/);
  assert.match(controls, /<AppText variant="caption" muted style=/);
  assert.match(
    input,
    /placeholderTextColor=\{borderless \? theme\.colors\.inputPlaceholder : theme\.colors\.secondaryText\}/,
  );
  assert.match(input, /color: theme\.colors\.primaryText/);
  assert.match(
    form,
    /labelAsPlaceholder=\{field === 'name' \|\| description\}\s+leading=\{leading\}/,
  );
  assert.match(
    form,
    /multiline=\{description\}[\s\S]*?submitBehavior=\{description \? 'blurAndSubmit'/,
  );
  assert.match(input, /const growsWithText = borderless && props.multiline/);
  assert.match(input, /const minHeight = theme\.textField\.minimumHeight;/);
  assert.match(input, /paddingVertical: growsWithText \? \(minHeight - lineHeight\) \/ 2/);
  assert.match(controls, /minHeight: theme\.textField\.minimumHeight,/);
  assert.doesNotMatch(input, /numberOfLines|maxHeight/);
  assert.match(form, /const leading = money \? \([\s\S]*?\{currencySymbol\}[\s\S]*?<Svg/);
  assert.match(form, /date \? t\('accountReferenceDatePlaceholder'\) : money \? '0'/);
  assert.match(
    route,
    /CURRENCY_OPTIONS\.find\(\(\{ code \}\) => code === draft.currency\)\?\.symbol/,
  );
  assert.match(controls, /placeholder=\{labelAsPlaceholder \? t\(label\) : props.placeholder\}/);
  assert.match(
    controls,
    /flexDirection: 'row'[\s\S]*?importantForAccessibility="no-hide-descendants"[\s\S]*?\{leading\}[\s\S]*?\{input\}/,
  );
  assert.doesNotMatch(bankModes, /leading=/);
});

test('payment mode editor uses compact outlined radios in one horizontal row', () => {
  const source = readFileSync('src/features/accounts/bank-payment-modes.tsx', 'utf8');
  const editor = source.slice(source.indexOf('export function BankModeEditor'));
  const controls = readFileSync('src/features/accounts/account-form-controls.tsx', 'utf8');
  const choices = controls.slice(controls.indexOf('export function AccountChoices'));
  const compactRow = choices.slice(choices.indexOf('if (compact)'));
  assert.match(editor, /label="accountModeType"\s+compact/);
  assert.match(editor, /value=\{editor.kind\}/);
  assert.match(editor, /type: 'mode.kind', value/);
  assert.match(choices, /selected && !compact \?/);
  assert.match(choices, /compactOptionHeight/);
  assert.match(choices, /borderColor: selected \? theme.colors.primaryText : theme.colors.border/);
  assert.match(choices, /muted=\{!selected\}/);
  assert.match(compactRow, /<ScrollView\s+horizontal\s+keyboardShouldPersistTaps="handled"/);
  assert.match(compactRow, /\{choices\}\s+<\/ScrollView>/);
  assert.match(controls, /labelAsPlaceholder \? null : <AppText>\{t\(label\)\}<\/AppText>/);
  assert.equal(editor.match(/<ActionButton/g)?.length, 1);
  assert.match(editor, /label=\{t\('accountModeApply'\)\}/);
  assert.match(editor, /onDismiss=\{\(\) => onAction\(\{ type: 'mode.cancel' \}\)\}/);
  assert.match(editor, /dismissAccessibilityLabel=\{t\('accountCancel'\)\}/);
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
