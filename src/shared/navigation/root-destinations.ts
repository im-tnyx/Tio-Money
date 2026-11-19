/** Owner navigation decision for the Phase 0 shell, recorded in TM-DEC-004. */
export const ROOT_DESTINATIONS = [
  { href: '/', label: 'Home', accessibleName: 'Home', glyph: '⌂' },
  { href: '/transactions', label: 'Trans.', accessibleName: 'Transactions', glyph: '≡' },
  { href: '/reports', label: 'Stats.', accessibleName: 'Statistics', glyph: '▥' },
  { href: '/accounts', label: 'Account', accessibleName: 'Accounts', glyph: '▤' },
  { href: '/more', label: 'More', accessibleName: 'More', glyph: '•••' },
] as const;

export const ADD_TRANSACTION_ROUTE = '/transaction/new' as const;
