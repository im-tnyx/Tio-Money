import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

export function ScreenHeader({
  title,
  subtitle,
  showSettings = true,
}: {
  title: string;
  subtitle: string;
  showSettings?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <AppText variant="title" style={{ flex: 1 }}>
          {title}
        </AppText>
        {showSettings ? (
          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              style={{
                minWidth: 48,
                minHeight: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.elevated,
              }}
            >
              <AppText style={{ fontWeight: '700' }}>⚙</AppText>
            </Pressable>
          </Link>
        ) : null}
      </View>
      <AppText muted>{subtitle}</AppText>
    </View>
  );
}
