import { View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { ActionButton } from '@/shared/ui/action-button';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import {
  paymentModeTypes,
  type AccountDraft,
  type AddAccountViewModel,
} from './account-form-contract';
import { AccountChoices, AccountField } from './account-form-controls';

const modeLabels = {
  debitCard: 'accountCapabilityDebitCard',
  upi: 'accountCapabilityUpi',
  cheque: 'accountCapabilityCheque',
  internetBanking: 'accountCapabilityInternetBanking',
} as const;

type BankModesProps = Pick<AddAccountViewModel, 'canApplyMode' | 'animateSheet' | 'onAction'> & {
  readonly draft: Extract<AccountDraft, { group: 'bank' }>;
};

export function BankPaymentModes({ draft, onAction }: Pick<BankModesProps, 'draft' | 'onAction'>) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.sm }}>
      <View accessible accessibilityRole="header">
        <AppText variant="section">{t('accountModeSection')}</AppText>
      </View>
      {draft.modes.map((mode) => (
        <View
          key={mode.id}
          style={{
            padding: theme.space.md,
            borderWidth: theme.buttons.outlineWidth,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.card,
            gap: theme.space.xxs,
          }}
        >
          <AppText>{mode.name}</AppText>
          <AppText variant="caption" muted>
            {t(modeLabels[mode.kind])}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
            <ActionButton
              variant="secondary"
              compact
              label={t('accountModeEdit')}
              accessibilityLabel={t('accountModeEdit') + ' ' + mode.name}
              onPress={() => onAction({ type: 'mode.open', id: mode.id })}
            />
            <ActionButton
              variant="ghost"
              compact
              label={t('accountModeRemove')}
              accessibilityLabel={t('accountModeRemove') + ' ' + mode.name}
              onPress={() => onAction({ type: 'mode.remove', id: mode.id })}
            />
          </View>
        </View>
      ))}
      <ActionButton
        label={t('accountModeAdd')}
        variant="secondary"
        onPress={() => onAction({ type: 'mode.open' })}
      />
    </View>
  );
}

export function BankModeEditor({ draft, canApplyMode, animateSheet, onAction }: BankModesProps) {
  const theme = useAppTheme();
  const editor = draft.modeEditor;
  return (
    <AppBottomSheet
      visible={editor !== null}
      animate={animateSheet}
      avoidKeyboard
      title={t(editor?.id == null ? 'accountModeAdd' : 'accountModeEdit')}
      onDismiss={() => onAction({ type: 'mode.cancel' })}
      dismissAccessibilityLabel={t('accountCancel')}
    >
      {editor ? (
        <View style={{ padding: theme.space.lg, gap: theme.space.md }}>
          <AccountField
            label="accountModeName"
            value={editor.name}
            onChangeText={(value) => onAction({ type: 'mode.name', value })}
          />
          <AccountChoices
            label="accountModeType"
            options={paymentModeTypes.map((value) => ({ value, label: t(modeLabels[value]) }))}
            value={editor.kind}
            onChange={(value) => onAction({ type: 'mode.kind', value })}
          />
          <ActionButton
            label={t('accountModeApply')}
            disabled={!canApplyMode}
            onPress={() => onAction({ type: 'mode.apply' })}
          />
          <ActionButton
            label={t('accountCancel')}
            variant="ghost"
            onPress={() => onAction({ type: 'mode.cancel' })}
          />
        </View>
      ) : null}
    </AppBottomSheet>
  );
}
