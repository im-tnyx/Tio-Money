import { Pressable, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import {
  APPEARANCE_OPTIONS,
  type AppearancePreference,
} from '@/shared/theme/appearance-preference';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import { AppearanceOptionIcon } from './appearance-option-icon';
import type { MoreAction, MoreUiState } from './more-contract';

const labels = {
  system: 'appearanceSystem',
  light: 'appearanceLight',
  dark: 'appearanceDark',
} as const;

const descriptions = {
  system: 'appearanceSystemHint',
  light: 'appearanceLightHint',
  dark: 'appearanceDarkHint',
} as const;

function AppearanceOption({
  value,
  selected,
  showDivider,
  onAction,
}: {
  value: AppearancePreference;
  selected: boolean;
  showDivider: boolean;
  onAction: (action: MoreAction) => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={() => onAction({ type: 'appearance.select', preference: value })}
      accessibilityRole="radio"
      accessibilityLabel={t(labels[value])}
      accessibilityHint={t(descriptions[value])}
      accessibilityState={{ checked: selected }}
      style={{
        minHeight: theme.buttons.minimumHeight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.md,
        gap: theme.space.md,
        borderTopWidth: showDivider ? theme.navigation.borderWidth : theme.navigation.origin,
        borderTopColor: theme.colors.border,
      }}
    >
      <AppearanceOptionIcon name={value} color={theme.colors.secondaryText} />
      <View style={{ flex: 1 }}>
        <AppText>{t(labels[value])}</AppText>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          width: theme.icons.size,
          height: theme.icons.size,
          borderRadius: theme.radius.pill,
          borderWidth: theme.buttons.outlineWidth,
          borderColor: selected ? theme.colors.brand : theme.colors.secondaryText,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <View
            style={{
              width: theme.space.sm,
              height: theme.space.sm,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.brand,
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

/** Feature-only content. All modal chrome and dismissal semantics are shared. */
export function AppearanceSheet({
  state,
  onAction,
}: {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
}) {
  const theme = useAppTheme();
  const dismiss = () => onAction({ type: 'appearance.dismiss' });

  return (
    <AppBottomSheet
      visible={state.appearanceSheetVisible}
      title={t('theme')}
      dismissAccessibilityLabel={t('closeTheme')}
      onDismiss={dismiss}
    >
      <View accessibilityRole="radiogroup">
        {APPEARANCE_OPTIONS.map((option, index) => (
          <AppearanceOption
            key={option}
            value={option}
            selected={state.appearance === option}
            showDivider={index > 0}
            onAction={onAction}
          />
        ))}
      </View>
      {state.error ? (
        <View
          accessibilityLiveRegion="polite"
          style={{
            paddingHorizontal: theme.space.md,
            paddingVertical: theme.space.sm,
          }}
        >
          <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
        </View>
      ) : null}
    </AppBottomSheet>
  );
}
