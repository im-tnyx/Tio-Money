import { Slot } from 'expo-router';
import { View } from 'react-native';

import { RootTabBar } from '@/shared/ui/root-tab-bar';
import { useAppTheme } from '@/shared/theme/theme-provider';

/** Four content routes + one central Add *action*. No fifth content tab. */
export default function RootTabsLayout() {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <RootTabBar />
    </View>
  );
}
