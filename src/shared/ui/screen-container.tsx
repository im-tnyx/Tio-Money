import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/theme/theme-provider';

export function ScreenContainer({
  children,
  includeBottomInset = false,
}: {
  children: ReactNode;
  includeBottomInset?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <SafeAreaView
      edges={includeBottomInset ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.space.lg,
            paddingVertical: theme.space.lg,
          }}
        >
          <View style={{ width: '100%', maxWidth: 600, alignSelf: 'center', gap: theme.space.lg }}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
