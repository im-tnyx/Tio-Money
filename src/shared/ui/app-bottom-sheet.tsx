import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';

/** Visual-only sheet shell. The caller owns state, content and any selection actions. */
export function AppBottomSheet({
  visible,
  title,
  dismissAccessibilityLabel,
  onDismiss,
  children,
}: {
  visible: boolean;
  title: string;
  dismissAccessibilityLabel: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const sheet = theme.bottomSheet;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={dismissAccessibilityLabel}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.shadow, opacity: sheet.backdropOpacity },
          ]}
        />
        <SafeAreaView
          edges={['bottom', 'left', 'right']}
          accessibilityViewIsModal
          onAccessibilityEscape={onDismiss}
          style={{
            width: '100%',
            maxHeight: sheet.maxHeight,
            backgroundColor: theme.colors.card,
            borderTopLeftRadius: sheet.topCornerRadius,
            borderTopRightRadius: sheet.topCornerRadius,
            overflow: 'hidden',
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: sheet.handleWidth,
              height: sheet.handleHeight,
              borderRadius: sheet.handleRadius,
              backgroundColor: theme.colors.border,
              alignSelf: 'center',
              marginTop: sheet.handleTopMargin,
              marginBottom: sheet.handleBottomMargin,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: sheet.headerMinHeight,
              paddingHorizontal: sheet.headerHorizontalPadding,
              borderBottomWidth: sheet.headerDividerWidth,
              borderBottomColor: theme.colors.border,
            }}
          >
            <AppText variant="section" style={{ flex: 1, textAlign: 'center' }}>
              {title}
            </AppText>
          </View>
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
