import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

const ReducedMotionContext = createContext<boolean | null>(null);

/**
 * One app-wide OS Reduced Motion subscription shared by tabs and Stack detail routes.
 * Unknown or failed OS reads disable animation rather than assuming permission.
 */
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    let observedChange = false;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      observedChange = true;
      if (mounted) setReduceMotion(enabled);
    });

    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted && !observedChange) setReduceMotion(enabled);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduceMotion}>{children}</ReducedMotionContext.Provider>
  );
}

/** Navigation consumers must live inside the root provider, not start their own OS query. */
export function useReducedMotion(): boolean {
  const preference = useContext(ReducedMotionContext);
  if (preference === null) throw new Error('useReducedMotion requires ReducedMotionProvider');
  return preference;
}
