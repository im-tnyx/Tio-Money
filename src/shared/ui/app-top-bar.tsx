import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

export interface AppTopBarAction {
  readonly key: string;
  readonly icon: 'add' | 'eye' | 'eye-off' | 'save';
  readonly accessibilityLabel: string;
  readonly accessibilityHint?: string;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly selected?: boolean;
}

const iconPaths = {
  back: 'm15 18-6-6 6-6',
  close: 'm6 6 12 12M18 6 6 18',
  add: 'M12 5v14M5 12h14',
  save: 'M5 3h12l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 0v6h9V3M7 21v-7h10v7',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
} as const;

function TopBarIcon({
  name,
  round,
}: {
  readonly name: AppTopBarAction['icon'] | 'back' | 'close';
  readonly round: boolean;
}) {
  const theme = useAppTheme();
  const icon = (
    <Svg
      width={theme.iconRoles.topBar}
      height={theme.iconRoles.topBar}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d={iconPaths[name === 'eye-off' ? 'eye' : name]}
        stroke={theme.colors.primaryText}
        strokeWidth={theme.icons.stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {name === 'eye-off' ? (
        <Path
          d="M3 3l18 18"
          stroke={theme.colors.primaryText}
          strokeWidth={theme.icons.stroke}
          strokeLinecap="round"
        />
      ) : null}
    </Svg>
  );
  return round ? (
    <View
      style={{
        width: theme.space.xxxl,
        height: theme.space.xxxl,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </View>
  ) : (
    icon
  );
}

/** Presentation-only shared page header; host screen owns the OS safe-area inset. */
export function AppTopBar({
  title,
  onBack,
  backAccessibilityLabel,
  actions = [],
  editing = false,
}: {
  readonly title: string;
  readonly onBack?: () => void;
  readonly backAccessibilityLabel?: string;
  readonly actions?: readonly AppTopBarAction[];
  readonly editing?: boolean;
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
              paddingLeft: editing ? 0 : theme.space.sm,
              width: editing ? theme.buttons.minimumHeight : undefined,
              marginLeft: editing ? theme.space.xs : undefined,
              justifyContent: 'center',
              alignItems: editing ? 'center' : 'flex-start',
            }}
          >
            <TopBarIcon name={editing ? 'close' : 'back'} round={editing} />
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
          paddingRight: editing ? theme.space.xs : undefined,
        }}
      >
        {actions.map((action) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            accessibilityHint={action.accessibilityHint}
            accessibilityState={{
              disabled: action.disabled || !action.onPress,
              selected: action.selected ?? false,
            }}
            disabled={action.disabled || !action.onPress}
            onPress={action.onPress}
            style={{
              width: theme.buttons.minimumHeight,
              minHeight: theme.buttons.minimumHeight,
              alignItems: 'center',
              justifyContent: 'center',
              opacity:
                action.disabled || !action.onPress
                  ? theme.buttons.disabledOpacity
                  : theme.buttons.enabledOpacity,
            }}
          >
            <TopBarIcon name={action.icon} round={editing} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
