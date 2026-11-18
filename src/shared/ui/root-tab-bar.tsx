import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

type RootItem = { href: Href; label: string; glyph: string };
const first: readonly RootItem[] = [
  { href: '/', label: 'Home', glyph: '⌂' },
  { href: '/history', label: 'History', glyph: '≡' },
];
const last: readonly RootItem[] = [
  { href: '/reports', label: 'Reports', glyph: '▥' },
  { href: '/accounts', label: 'Accounts', glyph: '▤' },
];

export function RootTabBar() {
  const theme = useAppTheme();
  const router = useRouter();
  const path = usePathname();
  const insets = useSafeAreaInsets();

  const rootItem = ({ href, label, glyph }: RootItem) => {
    const active = path === href;
    return (
      <Pressable
        key={label}
        onPress={() => router.navigate(href)}
        accessibilityRole="tab"
        accessibilityLabel={label + ' screen'}
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
          style={{ fontSize: 23, color: active ? theme.colors.brand : theme.colors.secondaryText }}
        >
          {glyph}
        </AppText>
        <AppText
          variant="caption"
          style={{
            fontSize: 11,
            fontWeight: active ? '700' : '500',
            color: active ? theme.colors.brand : theme.colors.secondaryText,
          }}
        >
          {label}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.space.xs,
        paddingTop: theme.space.xs,
        paddingBottom: Math.max(insets.bottom, theme.space.xs),
        backgroundColor: theme.colors.card,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      }}
    >
      {first.map(rootItem)}
      <Pressable
        onPress={() => router.push('/transaction/new')}
        accessibilityLabel="Add transaction"
        accessibilityHint="Opens a single editor with Income, Expense and Transfer tabs"
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: 58,
          height: 58,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.brand,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <AppText style={{ fontSize: 30, fontWeight: '400', color: theme.colors.brandText }}>
          +
        </AppText>
      </Pressable>
      {last.map(rootItem)}
    </View>
  );
}
