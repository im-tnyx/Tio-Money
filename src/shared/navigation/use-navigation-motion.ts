import { useAppTheme } from '@/shared/theme/theme-provider';

import { getNavigationMotion } from './navigation-motion';
import { useReducedMotion } from './reduced-motion-provider';

/** Reusable theme-owned navigation motion for all routes; no screen-owned timing. */
export function useNavigationMotion() {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  return getNavigationMotion(reduceMotion, theme.navigation);
}
