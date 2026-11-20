import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import { AppearanceSheet } from './appearance-sheet';
import type { MoreAction, MoreUiState } from './more-contract';

/** Dumb presentation: bottom-sheet visibility and actions belong to the ViewModel. */
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
        <View style={{ width: '100%', gap: theme.space.sm }}>
          <AppText variant="section">{t('generalSettings')}</AppText>
          <Pressable
            onPress={() => onAction({ type: 'appearance.open' })}
            accessibilityRole="button"
            accessibilityLabel={t('appearance')}
            accessibilityHint={t('appearanceHint')}
            accessibilityState={{ expanded: state.appearanceSheetVisible }}
            style={{
              width: '100%',
              minHeight: theme.buttons.minimumHeight,
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderWidth: theme.navigation.borderWidth,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: theme.space.sm,
            }}
          >
            <AppText>{t('appearance')}</AppText>
            <Svg
              width={theme.iconRoles.card}
              height={theme.iconRoles.card}
              viewBox="0 0 24 24"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Path
                d="m9 18 6-6-6-6"
                stroke={theme.colors.secondaryText}
                strokeWidth={theme.icons.stroke}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          {state.error && !state.appearanceSheetVisible ? (
            <View accessibilityLiveRegion="polite">
              <AppText style={{ color: theme.colors.expense }}>{state.error}</AppText>
            </View>
          ) : null}
        </View>
      </ScrollView>
      <AppearanceSheet state={state} onAction={onAction} />
    </SafeAreaView>
  );
}
