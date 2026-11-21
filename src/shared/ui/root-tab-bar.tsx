import { Pressable, View } from 'react-native';

import { useRootTabNavigation } from '@/shared/navigation/use-root-tab-navigation';
import { ROOT_DESTINATIONS } from '@/shared/navigation/root-destinations';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';
import { RootTabIcon } from './root-tab-icon';

/** Five content tabs only; the independent Add FAB lives in the root layout. */
export function RootTabBar() {
  const theme = useAppTheme();
  const { pathname, insets, navigate } = useRootTabNavigation();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        paddingLeft: Math.max(insets.left, theme.navigation.horizontalPadding),
        paddingRight: Math.max(insets.right, theme.navigation.horizontalPadding),
        paddingTop: theme.navigation.topPadding,
        paddingBottom: Math.max(insets.bottom, theme.navigation.minimumBottomPadding),
        backgroundColor: theme.colors.card,
        borderTopWidth: theme.navigation.borderWidth,
        borderTopColor: theme.colors.border,
      }}
    >
      {ROOT_DESTINATIONS.map((item) => {
        const active = pathname === item.href;
        return (
          <Pressable
            key={item.href}
            onPress={() => navigate(item.href)}
            accessibilityRole="tab"
            accessibilityLabel={item.accessibleName + ' screen'}
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              minHeight: theme.navigation.itemHeight,
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.navigation.iconLabelGap,
            }}
          >
            <RootTabIcon
              name={item.icon}
              color={active ? theme.colors.brand : theme.colors.secondaryText}
              selected={active}
            />
            <AppText
              variant="caption"
              style={{
                fontSize: theme.navigation.labelFontSize,
                fontWeight: active ? theme.typography.boldWeight : theme.typography.mediumWeight,
                color: active ? theme.colors.brand : theme.colors.secondaryText,
              }}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
