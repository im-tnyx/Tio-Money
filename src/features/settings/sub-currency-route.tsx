import { SubCurrencyScreen } from './sub-currency-screen';
import { useSubCurrencyViewModel } from './use-sub-currency-view-model';

/** Route composes ViewModel and presentation. */
export function SubCurrencyRoute() {
  const { state, onAction } = useSubCurrencyViewModel();
  return <SubCurrencyScreen state={state} onAction={onAction} />;
}
