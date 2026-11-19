import { SplashScreen } from 'expo-router';
import { useCallback } from 'react';

/** Navigation lifecycle side effect must not live inside a route component. */
export function useRevealTabsOnLayout() {
  return useCallback(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);
}
