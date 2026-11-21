import type { UnitPosition } from '@/shared/currency/currency-preference';
import { t } from '@/shared/i18n/strings';
import { AppSegmentedControl } from '@/shared/ui/app-segmented-control';

/** Currency-specific labels, shared presentation control, controller-owned value. */
export function CurrencyUnitPositionControl({
  value,
  onChange,
}: {
  value: UnitPosition;
  onChange: (next: UnitPosition) => void;
}) {
  return (
    <AppSegmentedControl
      value={value}
      onChange={onChange}
      options={[
        { value: 'front', label: t('currencyFront') },
        { value: 'end', label: t('currencyEnd') },
      ]}
    />
  );
}
