import { usePathname, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ADD_TRANSACTION_ROUTE,
  ROOT_DESTINATIONS,
} from '@/shared/navigation/root-destinations';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

/** Exactly five content tabs; one independent, floating Add action above the bar. */
export function RootTabBar() {
  const theme = useAppTheme();
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'relative',
        zIndex: 10,
        overflow: 'visible',
        backgroundColor: theme.colors.card,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      }}
    >
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: 'row',
          paddingHorizontal: theme.space.xs,
          paddingTop: theme.space.xs,
          paddingBottom: Math.max(insets.bottom, theme.space.xs),
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
                minHeight: 56,
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
      <Pressable
        onPress={() => router.push(ADD_TRANSACTION_ROUTE)}
        accessibilityLabel="Add transaction"
        accessibilityHint="Opens a single editor with Income, Expense and Transfer tabs"
        accessibilityRole="button"
        style={({ pressed }) => ({
          position: 'absolute',
          right: Math.max(insets.right, 0) + theme.space.lg,
          bottom: Math.max(insets.bottom, theme.space.xs) + 72,
          width: 56,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.brand,
          shadowColor: '#000000',
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          elevation: 6,
          opacity: pressed ? 0.82 : 1,
        })}
      >
        <AppText style={{ fontSize: 30, fontWeight: '400', color: theme.colors.brandText }}>
          +
        </AppText>
      </Pressable>
    </View>
  );
}
