import { t } from '@/shared/i18n/strings';

import { CurrencyRadioChoiceSheet, type CurrencyRadioChoice } from './currency-radio-choice-sheet';
import type { SubCurrencyAction, SubCurrencyUiState } from './sub-currency-contract';

const decimalChoices = [
  { value: 0, label: 'currencyDecimalNone' },
  { value: 1, label: 'currencyDecimalOne' },
  { value: 2, label: 'currencyDecimalTwo' },
  { value: 3, label: 'currencyDecimalThree' },
] as const;

const formatChoices = [
  { value: 'international', label: 'currencyMillionsExample' },
  { value: 'indian', label: 'currencyLakhsExample' },
  { value: 'none', label: 'currencyNoFormatExample' },
] as const;

/** The shared sheet never writes settings; selection stays scoped to this saved Sub. */
export function SubCurrencyDetailOptionSheet({
  state,
  onAction,
}: {
  state: SubCurrencyUiState;
  onAction: (action: SubCurrencyAction) => void;
}) {
  const detail = state.detail;
  const kind = state.detailSheetKind;
  const choices: readonly CurrencyRadioChoice[] =
    detail && kind === 'decimal'
      ? decimalChoices.map((item) => ({
          key: String(item.value),
          label: t(item.label),
          selected: detail.decimalDigits === item.value,
          onSelect: () => onAction({ type: 'detail.decimal.select', value: item.value }),
        }))
      : detail && kind === 'format'
        ? formatChoices.map((item) => ({
            key: item.value,
            label: t(item.label),
            selected: detail.formatGrouping === item.value,
            onSelect: () => onAction({ type: 'detail.format.select', value: item.value }),
          }))
        : [];

  return (
    <CurrencyRadioChoiceSheet
      visible={detail !== null && kind !== null}
      title={t(kind === 'decimal' ? 'currencyDecimals' : 'currencyFormat')}
      dismissAccessibilityLabel={t('currencyCloseOptions')}
      onDismiss={() => onAction({ type: 'detail.options.dismiss' })}
      choices={choices}
    />
  );
}
