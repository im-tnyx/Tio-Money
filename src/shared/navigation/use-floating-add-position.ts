import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { navigationTokens } from '@/shared/theme/component-tokens';

import { getFloatingAddPosition } from './fab-layout';

/** Keep responsive geometry out of the disabled FAB presentation. */
export function useFloatingAddPosition() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return getFloatingAddPosition({
    windowWidth: width,
    leftInset: insets.left,
    rightInset: insets.right,
    bottomInset: insets.bottom,
    horizontalPadding: navigationTokens.horizontalPadding,
    topPadding: navigationTokens.topPadding,
    minimumBottomPadding: navigationTokens.minimumBottomPadding,
    floatingGap: navigationTokens.fabGap,
  });
}
