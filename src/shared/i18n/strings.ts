/** English-only MVP copy (TM-DEC-001). Typed keys keep future localization possible. */
export const en = {
  appName: 'Tio Money',
  home: 'Home',
  transactions: 'Transactions',
  stats: 'Statistics',
  accounts: 'Accounts',
  more: 'More',
  settings: 'Settings',
  generalSettings: 'General Settings',
  appearance: 'Appearance',
  appearanceHint: 'Choose how Tio Money looks on this device.',
  appearanceSystem: 'System',
  appearanceSystemHint: 'Follow device appearance',
  appearanceLight: 'Light',
  appearanceLightHint: 'Always use light appearance',
  appearanceDark: 'Dark',
  appearanceDarkHint: 'Always use dark appearance',
  appearanceLoadError: 'Appearance could not be loaded. Using System.',
  appearanceSaveError: 'Could not save appearance. Try again.',
  add: 'Add',
  addTransaction: 'Add transaction',
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
  save: 'Save',
  saveAnother: 'Save & Add Another',
  amount: 'Amount',
  category: 'Category',
  fromAccount: 'From account',
  toAccount: 'To account',
  dateTime: 'Date and time',
  note: 'Note (optional)',
  fee: 'Transfer fees',
  noHistory: 'No transactions yet',
  featurePending: 'This feature is being built',
  retry: 'Try again',
} as const;

export type TranslationKey = keyof typeof en;
/** A future catalog may implement these stable keys in another locale; MVP has none. */
export type MessageCatalog = { readonly [K in TranslationKey]: string };

export function t(key: TranslationKey): string {
  return en[key];
}
