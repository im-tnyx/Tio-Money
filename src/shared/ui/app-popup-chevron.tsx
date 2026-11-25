import { useEffect, useState } from 'react';
import { Animated, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useReducedMotion } from '@/shared/navigation/reduced-motion-provider';
import { useAppTheme } from '@/shared/theme/theme-provider';

/** Decorative disclosure indicator. The popup trigger owns accessibility and open state. */
export function AppPopupChevron({ open }: { readonly open: boolean }) {
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(open ? 1 : 0));
  const duration = theme.optionPopup.chevronDurationMs;

  useEffect(() => {
    const target = open ? 1 : 0;
    if (reduceMotion) {
      progress.setValue(target);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: target,
      duration,
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [duration, open, progress, reduceMotion]);

  const rotate = reduceMotion
    ? open
      ? '90deg'
      : '0deg'
    : progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ flexShrink: 0, transform: [{ rotate }] }}
    >
      <Svg width={theme.iconRoles.textField} height={theme.iconRoles.textField} viewBox="0 0 24 24">
        <Path
          d="m9 6 6 6-6 6"
          fill="none"
          stroke={theme.colors.secondaryText}
          strokeWidth={theme.icons.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
