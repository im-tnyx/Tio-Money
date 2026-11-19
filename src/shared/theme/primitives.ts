/**
 * Canonical physical geometry and opacity values for the current React Native UI.
 * Add a new physical value only when evidence or an owner-approved UI contract needs it.
 * Reusable roles must alias this registry, never copy its numeric values.
 */
export const size = {
  dp0: 0,
  dp1: 1,
  dp1_5: 1.5,
  dp2: 2,
  dp3: 3,
  dp4: 4,
  dp5: 5,
  dp5_5: 5.5,
  dp6: 6,
  dp7: 7,
  dp8: 8,
  dp9: 9,
  dp10: 10,
  dp11: 11,
  dp12: 12,
  dp12_5: 12.5,
  dp13: 13,
  dp14: 14,
  dp15: 15,
  dp16: 16,
  dp17: 17,
  dp18: 18,
  dp19: 19,
  dp20: 20,
  dp21: 21,
  dp22: 22,
  dp24: 24,
  dp26: 26,
  dp30: 30,
  dp32: 32,
  dp34: 34,
  dp40: 40,
  dp48: 48,
  dp56: 56,
  dp100: 100,
} as const;

/** Visual state transparency and elevation alpha. */
export const opacity = {
  enabled: 1,
  fabShadow: 0.18,
  disabled: 0.48,
  pressed: 0.8,
} as const;
