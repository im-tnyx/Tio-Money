import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { t } from '@/shared/i18n/strings';
import {
  APPEARANCE_OPTIONS,
  type AppearancePreference,
} from '@/shared/theme/appearance-preference';
import { useAppTheme } from '@/shared/theme/theme-provider';
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
        paddingVertical: theme.space.lg,
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

/** Stateless native bottom sheet. All visibility and selection state is injected. */
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
    <Modal
      visible={state.appearanceSheetVisible}
      transparent
      animationType="slide"
      onRequestClose={dismiss}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel={t('closeAppearance')}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.shadow, opacity: 0.45 }]}
        />
        <SafeAreaView
          edges={['bottom', 'left', 'right']}
          accessibilityViewIsModal
          style={{
            width: '100%',
            maxHeight: '90%',
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: theme.navigation.origin,
            borderTopRightRadius: theme.navigation.origin,
            overflow: 'hidden',
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: theme.space.xxxl,
              height: theme.space.xxs,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.border,
              alignSelf: 'center',
              marginTop: theme.space.sm,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: theme.space.md,
              paddingVertical: theme.space.sm,
              borderBottomWidth: theme.navigation.borderWidth,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ width: theme.buttons.minimumHeight }}
            />
            <AppText variant="section" style={{ flex: 1, textAlign: 'center' }}>
              {t('appearance')}
            </AppText>
            <Pressable
              onPress={dismiss}
              accessibilityRole="button"
              accessibilityLabel={t('closeAppearance')}
              style={{
                minHeight: theme.buttons.minimumHeight,
                minWidth: theme.buttons.minimumHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg
                width={theme.iconRoles.card}
                height={theme.iconRoles.card}
                viewBox="0 0 24 24"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Path
                  d="M18 6 6 18 M6 6l12 12"
                  stroke={theme.colors.primaryText}
                  strokeWidth={theme.icons.stroke}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          </View>
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
        </SafeAreaView>
      </View>
    </Modal>
  );
}
