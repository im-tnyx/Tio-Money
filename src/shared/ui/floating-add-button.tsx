import { useRouter } from 'expo-router';
import { Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_ADD_SIZE, getFloatingAddPosition } from '@/shared/navigation/fab-layout';
import { ADD_TRANSACTION_ROUTE } from '@/shared/navigation/root-destinations';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

/**
 * A sibling of both content and the tab bar, within the full-screen root.
 * This keeps the button's touch area inside its parent on Android and iOS.
 */
export function FloatingAddButton() {
  const router = useRouter();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { right, bottom } = getFloatingAddPosition({
    windowWidth: width,
    leftInset: insets.left,
    rightInset: insets.right,
    bottomInset: insets.bottom,
    horizontalPadding: theme.space.xs,
    topPadding: theme.space.xs,
    floatingGap: theme.space.sm,
  });

  return (
    <Pressable
      onPress={() => router.push(ADD_TRANSACTION_ROUTE)}
      accessibilityLabel="Add transaction"
      accessibilityHint="Opens a single editor with Income, Expense and Transfer tabs"
      accessibilityRole="button"
      style={({ pressed }) => ({
        position: 'absolute',
        right,
        bottom,
        zIndex: 20,
        elevation: 6,
        width: FLOATING_ADD_SIZE,
        height: FLOATING_ADD_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.brand,
        shadowColor: '#000000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        opacity: pressed ? 0.82 : 1,
      })}
    >
      <AppText style={{ fontSize: 30, fontWeight: '400', color: theme.colors.brandText }}>
        +
      </AppText>
    </Pressable>
  );
}
