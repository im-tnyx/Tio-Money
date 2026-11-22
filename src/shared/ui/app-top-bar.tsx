import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

/** Shared, presentation-only page header. The screen owns the OS safe-area inset. */
export function AppTopBar({
  title,
  onBack,
  backAccessibilityLabel,
}: {
  readonly title: string;
  readonly onBack?: () => void;
  readonly backAccessibilityLabel?: string;
}) {
  const theme = useAppTheme();
  const sideWidth = theme.buttons.minimumHeight + theme.space.xxxl;

  return (
    <View
      style={{
        flexDirection: 'row',
        height: theme.navigation.topBarHeight,
        alignItems: 'center',
        borderBottomWidth: theme.navigation.borderWidth,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
      }}
    >
      <View style={{ width: sideWidth, justifyContent: 'center' }}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backAccessibilityLabel ?? title}
            onPress={onBack}
            style={{
              minHeight: theme.buttons.minimumHeight,
              paddingLeft: theme.space.sm,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
          >
            <Svg
              width={theme.iconRoles.topBar}
              height={theme.iconRoles.topBar}
              viewBox="0 0 24 24"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Path
                d="m15 18-6-6 6-6"
                stroke={theme.colors.primaryText}
                strokeWidth={theme.icons.stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </Pressable>
        ) : null}
      </View>
      <AppText
        variant="section"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={{ flex: 1, textAlign: 'center' }}
      >
        {title}
      </AppText>
      <View style={{ width: sideWidth }} />
    </View>
  );
}
