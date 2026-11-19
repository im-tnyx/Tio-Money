import { Slot } from 'expo-router';
import { View } from 'react-native';

import { useRevealTabsOnLayout } from '@/shared/navigation/use-reveal-tabs-on-layout';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { FloatingAddButton } from '@/shared/ui/floating-add-button';
import { RootTabBar } from '@/shared/ui/root-tab-bar';

/** Five content routes, with a separate floating Add overlay over More. */
export default function RootTabsLayout() {
  const theme = useAppTheme();
  const revealTabsOnLayout = useRevealTabsOnLayout();

  return (
    <View onLayout={revealTabsOnLayout} style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <RootTabBar />
      <FloatingAddButton />
    </View>
  );
}
