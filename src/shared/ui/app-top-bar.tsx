import { Pressable, View } from 'react-native';
import Svg, { Path, SvgXml } from 'react-native-svg';

import saveIcon from '@/shared/assets/google-material-icons/save-icon.json';
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
  close: 'm5.5 5.5 13 13m0-13-13 13',
  add: 'M12 5v14M5 12h14',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
} as const;

function TopBarIcon({
  name,
  round,
  muted = false,
}: {
  readonly name: AppTopBarAction['icon'] | 'back' | 'close';
  readonly round: boolean;
  readonly muted?: boolean;
}) {
  const theme = useAppTheme();
  const color = muted ? theme.colors.secondaryText : theme.colors.primaryText;
  const iconSize = round ? theme.navigation.editorActionIconSize : theme.iconRoles.topBar;
  const icon =
    name === 'save' ? (
      <SvgXml
        xml={saveIcon}
        width={iconSize}
        height={iconSize}
        fill={color}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    ) : (
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Path
          d={iconPaths[name === 'eye-off' ? 'eye' : name]}
          stroke={color}
          strokeWidth={theme.icons.stroke}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {name === 'eye-off' ? (
          <Path
            d="M3 3l18 18"
            stroke={color}
            strokeWidth={theme.icons.stroke}
            strokeLinecap="round"
          />
        ) : null}
      </Svg>
    );
  return round ? (
    <View
      style={{
        width: theme.navigation.editorActionDiameter,
        height: theme.navigation.editorActionDiameter,
        borderRadius: theme.radius.pill,
        borderWidth: theme.navigation.borderWidth,
        borderColor: theme.colors.border,
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
        {actions.map((action) => {
          const disabled = action.disabled || !action.onPress;
          return (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              accessibilityHint={action.accessibilityHint}
              accessibilityState={{
                disabled,
                selected: action.selected ?? false,
              }}
              disabled={disabled}
              onPress={action.onPress}
              style={{
                width: theme.buttons.minimumHeight,
                minHeight: theme.buttons.minimumHeight,
                alignItems: 'center',
                justifyContent: 'center',
                opacity:
                  disabled && !editing
                    ? theme.buttons.disabledOpacity
                    : theme.buttons.enabledOpacity,
              }}
            >
              <TopBarIcon name={action.icon} round={editing} muted={editing && disabled} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
