import { usePathname, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NAV_BORDER_WIDTH, NAV_ITEM_HEIGHT } from '@/shared/navigation/fab-layout';
import { ROOT_DESTINATIONS } from '@/shared/navigation/root-destinations';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

/** Five content tabs only; the independent Add FAB lives in the root layout. */
export function RootTabBar() {
  const theme = useAppTheme();
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        paddingLeft: Math.max(insets.left, theme.space.xs),
        paddingRight: Math.max(insets.right, theme.space.xs),
        paddingTop: theme.space.xs,
        paddingBottom: Math.max(insets.bottom, theme.space.xs),
        backgroundColor: theme.colors.card,
        borderTopWidth: NAV_BORDER_WIDTH,
        borderTopColor: theme.colors.border,
      }}
    >
      {ROOT_DESTINATIONS.map((item) => {
        const active = path === item.href;
        return (
          <Pressable
            key={item.href}
            onPress={() => router.navigate(item.href)}
            accessibilityRole="tab"
            accessibilityLabel={item.accessibleName + ' screen'}
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              minHeight: NAV_ITEM_HEIGHT,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <AppText
              style={{
                fontSize: 23,
                color: active ? theme.colors.brand : theme.colors.secondaryText,
              }}
            >
              {item.glyph}
            </AppText>
            <AppText
              variant="caption"
              style={{
                fontSize: 11,
                fontWeight: active ? '700' : '500',
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
