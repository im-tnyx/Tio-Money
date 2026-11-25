import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppPopupChevron } from '@/shared/ui/app-popup-chevron';
import { AppText } from '@/shared/ui/app-text';

import type { AccountDraftChoice } from './account-form-contract';
import { AccountChoices, AccountFormRow } from './account-form-controls';
import { accountPopupPosition, type AccountPopupAnchor } from './account-popup-position';

export function AccountDropdown({
  choice,
  leading,
}: {
  readonly choice: AccountDraftChoice;
  readonly leading: ReactNode;
}) {
  const theme = useAppTheme();
  const trigger = useRef<ComponentRef<typeof Pressable>>(null);
  const [anchor, setAnchor] = useState<AccountPopupAnchor | null>(null);
  const viewport = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { label, value, options, open, onOpen, onClose } = choice;
  const measureAnchor = () => {
    trigger.current?.measureInWindow((x, y, width, height) => {
      setAnchor(
        width > 0 && height > 0
          ? { x, y, width, height }
          : {
              x: viewport.width - insets.right,
              y: insets.top + theme.space.xl,
              width: theme.navigation.origin,
              height: theme.navigation.origin,
            },
      );
    });
  };
  const preferredRowHeight = Math.max(
    theme.buttons.minimumHeight,
    Math.ceil(theme.typeScale.body * theme.typography.relativeLineHeight) * viewport.fontScale +
      theme.space.md,
  );
  const position = anchor
    ? accountPopupPosition(anchor, viewport, insets, {
        margin: theme.space.xs,
        gap: theme.space.xxs,
        preferredWidth: theme.optionPopup.width,
        preferredHeight: options.length * preferredRowHeight + theme.space.md,
      })
    : undefined;

  return (
    <>
      <Pressable
        ref={trigger}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel={t(label)}
        accessibilityValue={{ text: t(value) }}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          measureAnchor();
          onOpen();
        }}
      >
        <AccountFormRow label={label} leading={leading} minimumHeight={theme.buttons.minimumHeight}>
          <AppText
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ textAlign: 'right', includeFontPadding: false }}
          >
            {t(value)}
          </AppText>
          <AppPopupChevron open={open} />
        </AccountFormRow>
      </Pressable>
      {open ? (
        <Modal
          transparent
          presentationStyle="overFullScreen"
          statusBarTranslucent
          navigationBarTranslucent
          onShow={measureAnchor}
          onRequestClose={onClose}
        >
          <View style={{ flex: 1 }} accessibilityViewIsModal onAccessibilityEscape={onClose}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('closeAccountOptions')}
              onPress={onClose}
              style={StyleSheet.absoluteFill}
            />
            {position ? (
              <View
                style={{
                  position: 'absolute',
                  ...position,
                  borderRadius: theme.optionPopup.radius,
                  backgroundColor: theme.colors.optionPopup,
                  borderColor: theme.colors.border,
                  borderWidth: theme.navigation.borderWidth,
                  elevation: theme.optionPopup.elevation,
                  shadowColor: theme.colors.shadow,
                  shadowOpacity: theme.optionPopup.shadowOpacity,
                  shadowRadius: theme.optionPopup.shadowRadius,
                  shadowOffset: {
                    width: theme.navigation.origin,
                    height: theme.optionPopup.shadowOffsetY,
                  },
                }}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={{ flexGrow: 0, borderRadius: theme.optionPopup.radius }}
                  contentContainerStyle={{ paddingVertical: theme.space.xs }}
                >
                  <AccountChoices label={label} options={options} />
                </ScrollView>
              </View>
            ) : null}
          </View>
        </Modal>
      ) : null}
    </>
  );
}
