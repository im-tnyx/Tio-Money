import { Stack, useRouter } from 'expo-router';

import { AccountGroupsScreen } from './account-groups-screen';
import { useAccountGroupsViewModel } from './use-account-groups-view-model';
import { useAccountGroupSwipeController } from './use-account-group-swipe-controller';

/** Router concerns stay in this controller; screens receive only state and intents. */
export function AccountGroupsRoute() {
  const router = useRouter();
  const { state, onAction } = useAccountGroupsViewModel(() => router.back());
  const swipe = useAccountGroupSwipeController();

  // TM-DEC-011: route/controller owns Back, Rename, and Delete workflow choices.
  const onBack = () => {
    if (swipe.openId !== null) {
      swipe.close();
      return;
    }
    onAction({ type: 'back' });
  };
  const onCustomGroupPress = (id: string) => {
    if (swipe.openId !== null) {
      swipe.close();
      return;
    }
    onAction({ type: 'custom.edit', id });
  };
  const onCustomGroupDelete = (id: string) => {
    swipe.close();
    onAction({ type: 'custom.remove', id });
  };

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: !swipe.cardTouchActive }} />
      <AccountGroupsScreen
        state={state}
        onAction={onAction}
        swipe={swipe}
        onBack={onBack}
        onCustomGroupPress={onCustomGroupPress}
        onCustomGroupDelete={onCustomGroupDelete}
        onDismissRevealedDelete={swipe.close}
      />
    </>
  );
}
