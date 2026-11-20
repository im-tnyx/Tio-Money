import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import {
  APPEARANCE_OPTIONS,
  type AppearancePreference,
} from '@/shared/theme/appearance-preference';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

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
  onAction,
}: {
  value: AppearancePreference;
  selected: boolean;
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
        paddingHorizontal: theme.space.md,
        paddingVertical: theme.space.sm,
        gap: theme.space.sm,
        borderTopWidth: theme.navigation.borderWidth,
        borderTopColor: theme.colors.border,
      }}
    >
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
      <View style={{ flex: 1, gap: theme.space.xxs }}>
        <AppText>{t(labels[value])}</AppText>
        <AppText variant="caption" muted>
          {t(descriptions[value])}
        </AppText>
      </View>
    </Pressable>
  );
}

/** Dumb presentation: state and actions arrive from the Route/ViewModel. */
export function MoreScreen({
  state,
  onAction,
}: {
  state: MoreUiState;
  onAction: (action: MoreAction) => void;
}) {
  const theme = useAppTheme();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.space.lg,
          paddingBottom: theme.space.xxxl,
          gap: theme.space.lg,
        }}
      >
        <AppText variant="title">{t('more')}</AppText>
        <View style={{ gap: theme.space.sm }}>
          <AppText variant="section">{t('generalSettings')}</AppText>
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderWidth: theme.navigation.borderWidth,
              borderRadius: theme.radius.md,
              overflow: 'hidden',
            }}
          >
            <View style={{ padding: theme.space.md, gap: theme.space.xxs }}>
              <AppText variant="section">{t('appearance')}</AppText>
              <AppText variant="caption" muted>
                {t('appearanceHint')}
              </AppText>
            </View>
            {APPEARANCE_OPTIONS.map((option) => (
              <AppearanceOption
                key={option}
                value={option}
                selected={state.appearance === option}
                onAction={onAction}
              />
            ))}
          </View>
          {state.error ? (
            <View accessibilityLiveRegion="polite">
              <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
