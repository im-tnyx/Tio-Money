import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { useReducedTabMotion } from '@/shared/navigation/use-reduced-tab-motion';
import { useRevealTabsOnLayout } from '@/shared/navigation/use-reveal-tabs-on-layout';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { FloatingAddButton } from '@/shared/ui/floating-add-button';
import { RootTabBar } from '@/shared/ui/root-tab-bar';

/** Five tab scenes crossfade independently of the preserved custom bar and Add FAB. */
export default function RootTabsLayout() {
  const theme = useAppTheme();
  const revealTabsOnLayout = useRevealTabsOnLayout();
  const reduceMotion = useReducedTabMotion();

  return (
    <View onLayout={revealTabsOnLayout} style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={{ flex: 1 }}>
        <Tabs
          backBehavior="history"
          tabBar={() => null}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: theme.colors.canvas },
            animation: reduceMotion ? 'none' : 'fade',
            transitionSpec: {
              animation: 'timing',
              config: { duration: theme.navigation.tabCrossfadeDurationMs },
            },
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="transactions" />
          <Tabs.Screen name="reports" />
          <Tabs.Screen name="accounts" />
          <Tabs.Screen name="more" />
        </Tabs>
      </View>
      <RootTabBar />
      <FloatingAddButton />
    </View>
  );
}
