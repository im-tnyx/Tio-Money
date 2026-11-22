import { Pressable, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppBottomSheet } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

export interface CurrencyRadioChoice {
  readonly key: string;
  readonly label: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
}

/** One accessible radio-choice sheet for Main and saved Sub currencies. */
export function CurrencyRadioChoiceSheet({
  visible,
  title,
  dismissAccessibilityLabel,
  onDismiss,
  choices,
}: {
  visible: boolean;
  title: string;
  dismissAccessibilityLabel: string;
  onDismiss: () => void;
  choices: readonly CurrencyRadioChoice[];
}) {
  const theme = useAppTheme();
  return (
    <AppBottomSheet
      visible={visible}
      title={title}
      dismissAccessibilityLabel={dismissAccessibilityLabel}
      onDismiss={onDismiss}
    >
      <View accessibilityRole="radiogroup">
        {choices.map((choice) => (
          <Pressable
            key={choice.key}
            accessibilityRole="radio"
            accessibilityLabel={choice.label}
            accessibilityState={{ checked: choice.selected }}
            onPress={choice.onSelect}
            style={{
              minHeight: theme.buttons.minimumHeight,
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.md,
              borderBottomWidth: theme.navigation.borderWidth,
              borderBottomColor: theme.colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.md,
            }}
          >
            <AppText style={{ flex: 1 }}>{choice.label}</AppText>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                width: theme.iconRoles.bottomSheet,
                height: theme.iconRoles.bottomSheet,
                borderRadius: theme.radius.pill,
                borderWidth: theme.buttons.outlineWidth,
                borderColor: choice.selected ? theme.colors.brand : theme.colors.secondaryText,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {choice.selected ? (
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
        ))}
      </View>
    </AppBottomSheet>
  );
}
