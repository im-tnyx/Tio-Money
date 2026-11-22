import { Stack, useRouter } from 'expo-router';

import { AccountGroupsScreen } from './account-groups-screen';
import { useAccountGroupsViewModel } from './use-account-groups-view-model';
import { useAccountGroupSwipeController } from './use-account-group-swipe-controller';

/** Router concerns stay in this controller; screens receive only state and intents. */
export function AccountGroupsRoute() {
  const router = useRouter();
  const { state, onAction } = useAccountGroupsViewModel(() => router.back());
  const swipe = useAccountGroupSwipeController();
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: !swipe.cardTouchActive }} />
      <AccountGroupsScreen state={state} onAction={onAction} swipe={swipe} />
    </>
  );
}
