import { useLocalSearchParams } from 'expo-router';

import { isCurrencyCode } from '@/shared/currency/currency-preference';

import { SubCurrencyDetailScreen } from './sub-currency-detail-screen';
import { useSubCurrencyViewModel } from './use-sub-currency-view-model';

/** Deep links are validated, and only saved Sub codes produce editable details. */
export function SubCurrencyDetailRoute() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const selectedCode = typeof code === 'string' && isCurrencyCode(code) ? code : null;
  const { state, onAction } = useSubCurrencyViewModel(selectedCode);
  return <SubCurrencyDetailScreen state={state} onAction={onAction} />;
}
