import { MainCurrencyScreen } from './main-currency-screen';
import { useMainCurrencyViewModel } from './use-main-currency-view-model';

/** Composition only. Navigation, selection and persistence are controller-owned. */
export function MainCurrencyRoute() {
  const { state, onAction } = useMainCurrencyViewModel();
  return <MainCurrencyScreen state={state} onAction={onAction} />;
}
