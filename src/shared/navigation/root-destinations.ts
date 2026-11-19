/** Owner-approved Phase 0 bottom navigation. Every destination has empty content. */
export const ROOT_DESTINATIONS = [
  { href: '/', label: 'Home', accessibleName: 'Home', glyph: '⌂' },
  { href: '/transactions', label: 'Trans.', accessibleName: 'Transactions', glyph: '≡' },
  { href: '/reports', label: 'Stats.', accessibleName: 'Statistics', glyph: '▥' },
  { href: '/accounts', label: 'Account', accessibleName: 'Accounts', glyph: '▤' },
  { href: '/more', label: 'More', accessibleName: 'More', glyph: '•••' },
] as const;
