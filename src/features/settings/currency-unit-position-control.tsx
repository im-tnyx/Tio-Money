import { Pressable, View } from 'react-native';

import type { UnitPosition } from '@/shared/currency/currency-preference';
import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

function PositionButton({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: theme.buttons.minimumHeight,
        borderWidth: theme.buttons.outlineWidth,
        borderColor: selected ? theme.colors.brand : theme.colors.border,
        backgroundColor: selected ? theme.colors.elevated : theme.colors.card,
        borderRadius: theme.radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AppText>{label}</AppText>
    </Pressable>
  );
}

/** Stateless visual control: the parent controller owns the actual preference. */
export function CurrencyUnitPositionControl({
  value,
  onChange,
}: {
  value: UnitPosition;
  onChange: (next: UnitPosition) => void;
}) {
  const theme = useAppTheme();
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: theme.space.sm }}>
      <PositionButton
        label={t('currencyFront')}
        selected={value === 'front'}
        onPress={() => onChange('front')}
      />
      <PositionButton
        label={t('currencyEnd')}
        selected={value === 'end'}
        onPress={() => onChange('end')}
      />
    </View>
  );
}
