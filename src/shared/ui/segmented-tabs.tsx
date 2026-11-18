import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

export type TransactionTab = 'income' | 'expense' | 'transfer';
const OPTIONS: readonly { key: TransactionTab; label: string }[] = [
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expense' },
  { key: 'transfer', label: 'Transfer' },
];

export function SegmentedTabs({
  value,
  onChange,
}: {
  value: TransactionTab;
  onChange: (value: TransactionTab) => void;
}) {
  const theme = useAppTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.elevated,
        borderRadius: theme.radius.sm,
        padding: theme.space.xxs,
        gap: theme.space.xxs,
      }}
    >
      {OPTIONS.map((option) => (
        <Pressable
          key={option.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === option.key }}
          accessibilityLabel={option.label + ' transaction tab'}
          onPress={() => onChange(option.key)}
          style={{
            flex: 1,
            minHeight: 48,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: theme.radius.xs,
            backgroundColor: value === option.key ? theme.colors.card : 'transparent',
          }}
        >
          <AppText
            style={{
              fontWeight: value === option.key ? '700' : '500',
              color: value === option.key ? theme.colors.brand : theme.colors.secondaryText,
              textAlign: 'center',
            }}
          >
            {option.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
