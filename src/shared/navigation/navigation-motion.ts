/** Navigation motion roles use one theme-owned duration, never per-screen literals. */
export interface NavigationMotionDurations {
  readonly tabCrossfadeDurationMs: number;
  readonly detailFadeDurationMs: number;
}

/**
 * JS Tabs and native Stack need different navigator APIs for the same fade intent.
 * Native Stack animationDuration is iOS-only; Android uses the native fade preset and OS timing.
 */
export function getNavigationMotion(
  reduceMotion: boolean,
  durations: NavigationMotionDurations,
  platform: string,
) {
  const animation = reduceMotion ? ('none' as const) : ('fade' as const);

  return {
    tab: {
      animation,
      transitionSpec: {
        animation: 'timing' as const,
        config: { duration: durations.tabCrossfadeDurationMs },
      },
    },
    detail: {
      animation,
      ...(platform === 'ios' ? { animationDuration: durations.detailFadeDurationMs } : {}),
    },
  };
}
