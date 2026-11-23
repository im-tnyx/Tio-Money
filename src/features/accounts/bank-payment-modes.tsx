import { Pressable, View } from 'react-native';
import Svg, { Path, SvgXml } from 'react-native-svg';

import paymentModeIcons from '@/shared/assets/google-material-icons/payment-mode-icons.json';
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

const actionIcons = {
  edit: 'm4 16-1 5 5-1L20 8l-4-4L4 16Z M14 6l4 4',
  remove: 'M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 10v7 M14 10v7',
} as const;

function ModeIcon({
  name,
  color,
}: {
  readonly name: keyof typeof paymentModeIcons;
  readonly color: string;
}) {
  const theme = useAppTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <SvgXml
        xml={paymentModeIcons[name]}
        fill={color}
        width={theme.iconRoles.button}
        height={theme.iconRoles.button}
      />
    </View>
  );
}

function ModeRowAction({
  icon,
  accessibilityLabel,
  onPress,
}: {
  readonly icon: 'edit' | 'remove';
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({
        width: theme.buttons.minimumHeight,
        minHeight: theme.buttons.minimumHeight,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? theme.buttons.pressedOpacity : theme.buttons.enabledOpacity,
      })}
    >
      <View
        style={{
          width: theme.buttons.smallActionHeight,
          height: theme.buttons.smallActionHeight,
          borderRadius: theme.radius.pill,
          borderWidth: theme.buttons.outlineWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.elevated,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg
          width={theme.buttons.smallActionIconSize}
          height={theme.buttons.smallActionIconSize}
          viewBox="0 0 24 24"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Path
            d={actionIcons[icon]}
            fill="none"
            stroke={icon === 'edit' ? theme.colors.primaryText : theme.colors.secondaryText}
            strokeWidth={theme.icons.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </Pressable>
  );
}

type BankModesProps = Pick<AddAccountViewModel, 'canApplyMode' | 'animateSheet' | 'onAction'> & {
  readonly draft: Extract<AccountDraft, { group: 'bank' }>;
};

export function BankPaymentModes({ draft, onAction }: Pick<BankModesProps, 'draft' | 'onAction'>) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        <View accessible accessibilityRole="header" style={{ flex: 1 }}>
          <AppText variant="section">{t('accountModeSection')}</AppText>
        </View>
        <ActionButton
          compact
          size="small"
          label={'+ ' + t('add')}
          accessibilityLabel={t('accountModeAdd')}
          variant="secondary"
          onPress={() => onAction({ type: 'mode.open' })}
        />
      </View>
      {draft.modes.map((mode) => (
        <View
          key={mode.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.space.xs,
          }}
        >
          <View
            accessible
            accessibilityLabel={mode.name + ', ' + t(modeLabels[mode.kind])}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}
          >
            <ModeIcon name={mode.kind} color={theme.colors.transfer} />
            <AppText style={{ flex: 1 }}>{mode.name}</AppText>
          </View>
          <ModeRowAction
            icon="edit"
            accessibilityLabel={t('accountModeEdit') + ': ' + mode.name}
            onPress={() => onAction({ type: 'mode.open', id: mode.id })}
          />
          <ModeRowAction
            icon="remove"
            accessibilityLabel={t('accountModeRemove') + ': ' + mode.name}
            onPress={() => onAction({ type: 'mode.remove', id: mode.id })}
          />
        </View>
      ))}
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
            labelAsPlaceholder
            value={editor.name}
            onChangeText={(value) => onAction({ type: 'mode.name', value })}
          />
          <AccountChoices
            label="accountModeType"
            compact
            options={paymentModeTypes.map((value) => ({ value, label: t(modeLabels[value]) }))}
            value={editor.kind}
            onChange={(value) => onAction({ type: 'mode.kind', value })}
          />
          <ActionButton
            label={t('accountModeApply')}
            disabled={!canApplyMode}
            onPress={() => onAction({ type: 'mode.apply' })}
          />
        </View>
      ) : null}
    </AppBottomSheet>
  );
}
