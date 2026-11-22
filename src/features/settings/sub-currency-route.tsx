import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';

import { SubCurrencyScreen } from './sub-currency-screen';
import { useSubCurrencyViewModel } from './use-sub-currency-view-model';

/**
 * Native iOS Back gesture remains available on the surrounding screen.
 * While a finger is on a currency card, give the card its own horizontal
 * gesture until touch release/cancel so right-swipe closes Delete instead
 * of popping the route. This is scoped to the Sub Currency route only.
 */
export function SubCurrencyRoute() {
  const { state, onAction } = useSubCurrencyViewModel();
  const [cardTouchActive, setCardTouchActive] = useState(false);
  const onCardTouchStart = useCallback(() => setCardTouchActive(true), []);
  const onCardTouchEnd = useCallback(() => setCardTouchActive(false), []);

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: !cardTouchActive }} />
      <SubCurrencyScreen
        state={state}
        onAction={onAction}
        onCardTouchStart={onCardTouchStart}
        onCardTouchEnd={onCardTouchEnd}
      />
    </>
  );
}
