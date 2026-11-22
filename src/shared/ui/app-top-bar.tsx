import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

export interface AppTopBarAction {
  readonly key: string;
  readonly icon: 'add' | 'eye' | 'eye-off';
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly selected?: boolean;
}

/** Presentation-only shared page header; host screen owns the OS safe-area inset. */
export function AppTopBar({
  title,
  onBack,
  backAccessibilityLabel,
  actions = [],
}: {
  readonly title: string;
  readonly onBack?: () => void;
  readonly backAccessibilityLabel?: string;
  readonly actions?: readonly AppTopBarAction[];
}) {
  const theme = useAppTheme();
  const sideWidth = Math.max(
    theme.buttons.minimumHeight + theme.space.xxxl,
    actions.length * theme.buttons.minimumHeight,
  );

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
      <View
        style={{
          width: sideWidth,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        {actions.map((action) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            accessibilityState={{
              disabled: action.disabled ?? false,
              selected: action.selected ?? false,
            }}
            disabled={action.disabled}
            onPress={action.onPress}
            style={{
              width: theme.buttons.minimumHeight,
              minHeight: theme.buttons.minimumHeight,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: action.disabled ? theme.buttons.disabledOpacity : theme.buttons.enabledOpacity,
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
                d={
                  action.icon === 'add'
                    ? 'M12 5v14M5 12h14'
                    : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'
                }
                stroke={theme.colors.primaryText}
                strokeWidth={theme.icons.stroke}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {action.icon === 'eye-off' ? (
                <Path
                  d="M3 3l18 18"
                  stroke={theme.colors.primaryText}
                  strokeWidth={theme.icons.stroke}
                  strokeLinecap="round"
                />
              ) : null}
            </Svg>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
