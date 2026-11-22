import { t } from '@/shared/i18n/strings';

import { CurrencyRadioChoiceSheet } from './currency-radio-choice-sheet';
import type { MainCurrencyAction, MainCurrencyUiState } from './main-currency-contract';

/** Main selection remains Main-only; the radio-sheet presentation is shared. */
export function MainCurrencyOptionSheet({
  state,
  onAction,
}: {
  state: MainCurrencyUiState;
  onAction: (action: MainCurrencyAction) => void;
}) {
  return (
    <CurrencyRadioChoiceSheet
      visible={state.sheetKind !== null}
      title={state.sheetTitle}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'dismiss' })}
      choices={state.choices.map((row) => ({
        key: row.key,
        label: row.label,
        selected: row.selected,
        onSelect: () => onAction({ type: 'select', choice: row.choice }),
      }))}
    />
  );
}
