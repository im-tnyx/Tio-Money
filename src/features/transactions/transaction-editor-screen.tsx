import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppText } from '@/shared/ui/app-text';
import { ScreenContainer } from '@/shared/ui/screen-container';
import { SectionCard } from '@/shared/ui/section-card';
import { SegmentedTabs, type TransactionTab } from '@/shared/ui/segmented-tabs';
import { TextField } from '@/shared/ui/text-field';

export function TransactionEditorScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [tab, setTab] = useState<TransactionTab>('expense');
  const [amount, setAmount] = useState('');
  const [feesVisible, setFeesVisible] = useState(false);

  return (
    <ScreenContainer includeBottomInset>
      <View style={{ alignItems: 'flex-start' }}>
        <ActionButton
          label="← Back"
          variant="ghost"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </View>
      <View style={{ gap: theme.space.xs }}>
        <AppText variant="title">Add transaction</AppText>
        <AppText muted>Unified editor preview · Saving is not available in Phase 0.</AppText>
      </View>
      <SegmentedTabs
        value={tab}
        onChange={(next) => {
          setTab(next);
          setFeesVisible(false);
        }}
      />
      <SectionCard>
        <TextField
          label="Amount (INR)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <TextField
          label="Date & time"
          value=""
          onChangeText={() => undefined}
          placeholder="Available when the editor is connected"
          disabled
        />
        {tab === 'income' ? (
          <>
            <TextField label="Income category" value="" onChangeText={() => undefined} disabled />
            <TextField label="To account" value="" onChangeText={() => undefined} disabled />
          </>
        ) : tab === 'expense' ? (
          <>
            <TextField label="Expense category" value="" onChangeText={() => undefined} disabled />
            <TextField label="From account" value="" onChangeText={() => undefined} disabled />
          </>
        ) : (
          <>
            <TextField label="From account" value="" onChangeText={() => undefined} disabled />
            <TextField label="To account" value="" onChangeText={() => undefined} disabled />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: feesVisible }}
              accessibilityLabel={feesVisible ? 'Hide transfer fees' : 'Add transfer fees'}
              onPress={() => setFeesVisible((visible) => !visible)}
              style={{ paddingVertical: theme.space.sm, minHeight: 48, justifyContent: 'center' }}
            >
              <AppText style={{ fontWeight: '700', color: theme.colors.brand }}>
                {feesVisible ? '− Hide transfer fees' : '+ Add transfer fees'}
              </AppText>
            </Pressable>
            {feesVisible ? (
              <>
                <TextField
                  label="Fee amount (INR)"
                  value=""
                  onChangeText={() => undefined}
                  placeholder="Enabled after ledger implementation"
                  disabled
                />
                <AppText variant="caption" muted>
                  Fee source/destination selection and exact money preview are planned. Fees will count as expenses.
                </AppText>
              </>
            ) : null}
          </>
        )}
      </SectionCard>
      <SectionCard>
        <AppText variant="section">Money movement preview</AppText>
        <AppText muted>
          Available after the balanced journal calculation service is built. Internal transfer principal will never be
          income or expense; only a real fee is an expense.
        </AppText>
      </SectionCard>
      <View style={{ gap: theme.space.sm }}>
        <ActionButton label="Save" disabled />
        <ActionButton label="Save & Add Another" variant="secondary" disabled />
        <AppText variant="caption" muted style={{ textAlign: 'center' }}>
          No transaction can be saved in this Phase 0 preview.
        </AppText>
      </View>
    </ScreenContainer>
  );
}
