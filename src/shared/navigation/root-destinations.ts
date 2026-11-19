/** Owner-approved five empty Phase 0 destinations and their native-drawn icon shapes. */
export type RootTabIconName = 'home' | 'transactions' | 'statistics' | 'accounts' | 'more';

export const ROOT_DESTINATIONS = [
  { href: '/', label: 'Home', accessibleName: 'Home', icon: 'home' },
  { href: '/transactions', label: 'Trans.', accessibleName: 'Transactions', icon: 'transactions' },
  { href: '/reports', label: 'Stats.', accessibleName: 'Statistics', icon: 'statistics' },
  { href: '/accounts', label: 'Account', accessibleName: 'Accounts', icon: 'accounts' },
  { href: '/more', label: 'More', accessibleName: 'More', icon: 'more' },
] as const satisfies readonly {
  href: string;
  label: string;
  accessibleName: string;
  icon: RootTabIconName;
}[];
