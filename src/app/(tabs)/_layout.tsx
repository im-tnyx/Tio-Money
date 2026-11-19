import { Slot } from 'expo-router';
import { View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { RootTabBar } from '@/shared/ui/root-tab-bar';

/** Five content destinations and one floating Add action, never an Add tab. */
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
