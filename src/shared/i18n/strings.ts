/** Bilingual message contract. User-selected language is deferred to Phase 1. */
const en = {
  appName: 'Tio Money',
  home: 'Home',
  history: 'History',
  reports: 'Reports',
  accounts: 'Accounts',
  settings: 'Settings',
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

type Messages = { [K in keyof typeof en]: string };

const hi: Messages = {
  appName: 'टियो मनी',
  home: 'होम',
  history: 'इतिहास',
  reports: 'रिपोर्ट',
  accounts: 'खाते',
  settings: 'सेटिंग्स',
  add: 'जोड़ें',
  addTransaction: 'लेन-देन जोड़ें',
  income: 'आय',
  expense: 'खर्च',
  transfer: 'ट्रांसफ़र',
  save: 'सेव करें',
  saveAnother: 'सेव करें और फिर जोड़ें',
  amount: 'राशि',
  category: 'श्रेणी',
  fromAccount: 'स्रोत खाता',
  toAccount: 'प्राप्तकर्ता खाता',
  dateTime: 'तारीख और समय',
  note: 'नोट (वैकल्पिक)',
  fee: 'ट्रांसफ़र शुल्क',
  noHistory: 'अभी कोई लेन-देन नहीं',
  featurePending: 'यह सुविधा तैयार की जा रही है',
  retry: 'फिर कोशिश करें',
};

export type TranslationKey = keyof typeof en;
export type Locale = 'en' | 'hi';

const dictionaries: Record<Locale, Messages> = { en, hi };
export function t(key: TranslationKey, locale: Locale = 'en'): string {
  return dictionaries[locale][key];
}
