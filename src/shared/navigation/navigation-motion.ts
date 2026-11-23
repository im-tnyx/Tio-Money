/** Navigation motion roles use one theme-owned duration, never per-screen literals. */
export interface NavigationMotionDurations {
  readonly tabCrossfadeDurationMs: number;
  readonly detailFadeDurationMs: number;
}

/**
 * JS Tabs and native Stack need different navigator APIs for the same fade intent.
 * Native Stack animationDuration is iOS-only; Android uses native horizontal slide timing.
 */
export function getNavigationMotion(
  reduceMotion: boolean,
  durations: NavigationMotionDurations,
  platform: string,
) {
  const animation = reduceMotion ? ('none' as const) : ('fade' as const);
  const detailAnimation: 'fade' | 'none' | 'slide_from_right' =
    !reduceMotion && platform === 'android' ? 'slide_from_right' : animation;

  return {
    tab: {
      animation,
      transitionSpec: {
        animation: 'timing' as const,
        config: { duration: durations.tabCrossfadeDurationMs },
      },
    },
    detail: {
      animation: detailAnimation,
      ...(platform === 'ios' ? { animationDuration: durations.detailFadeDurationMs } : {}),
    },
  };
}
