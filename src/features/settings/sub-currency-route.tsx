import { Stack, useLocalSearchParams } from 'expo-router';

import { SubCurrencyScreen } from './sub-currency-screen';
import { useSubCurrencyViewModel } from './use-sub-currency-view-model';
import { useSubCurrencySwipeController } from './use-sub-currency-swipe-controller';

/**
 * Native iOS Back gesture remains available on the surrounding screen.
 * While a finger is on a currency card, give the card its own horizontal
 * gesture until touch release/cancel so right-swipe closes Delete instead
 * of popping the route. This is scoped to the Sub Currency route only.
 */
export function SubCurrencyRoute() {
  const { add } = useLocalSearchParams<{ add?: string }>();
  const { state, onAction } = useSubCurrencyViewModel(null, add === '1');
  const swipe = useSubCurrencySwipeController();

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: !swipe.cardTouchActive }} />
      <SubCurrencyScreen state={state} onAction={onAction} swipe={swipe} />
    </>
  );
}
