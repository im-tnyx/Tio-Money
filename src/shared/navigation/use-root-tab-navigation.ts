import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ROOT_DESTINATIONS } from './root-destinations';

type RootTabHref = (typeof ROOT_DESTINATIONS)[number]['href'];

/** Route changes and platform safe areas belong outside presentation components. */
export function useRootTabNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return {
    pathname,
    insets,
    navigate: (href: RootTabHref) => router.navigate(href),
  };
}
