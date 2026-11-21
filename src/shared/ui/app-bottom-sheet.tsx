import { useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';
import {
  getBottomSheetHeightLimits,
  getDraggedBottomSheetHeight,
  shouldExpandBottomSheet,
} from './bottom-sheet-geometry';

/** Visibility/dismissal remains owned by callers. Unmount resets local drag state. */
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {visible ? (
        <SheetSurface
          title={title}
          dismissAccessibilityLabel={dismissAccessibilityLabel}
          onDismiss={onDismiss}
        >
          {children}
        </SheetSurface>
      ) : null}
    </Modal>
  );
}

/** One safe, scrollable and draggable presentation shell for all bottom sheets. */
function SheetSurface({
  title,
  dismissAccessibilityLabel,
  onDismiss,
  children,
}: {
  title: string;
  dismissAccessibilityLabel: string;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const sheet = theme.bottomSheet;
  const { height: windowHeight } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();
  const [viewportHeight, setViewportHeight] = useState(windowHeight);
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const currentHeight = useRef(0);
  const dragStartHeight = useRef(0);

  const { collapsedMax, expandedMax } = getBottomSheetHeightLimits(
    viewportHeight,
    topInset,
    sheet,
  );
  const touchStartY = useRef(0);

  return (
    <View
      onLayout={(event) => {
        const measured = event.nativeEvent.layout.height;
        setViewportHeight((previous) => (previous === measured ? previous : measured));
      }}
      style={{ flex: 1, justifyContent: 'flex-end' }}
    >
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
        onLayout={(event) => {
          currentHeight.current = event.nativeEvent.layout.height;
        }}
        style={{
          width: '100%',
          maxHeight: dragHeight === null && !expanded ? collapsedMax : expandedMax,
          height: dragHeight ?? (expanded ? expandedMax : undefined),
          backgroundColor: theme.colors.card,
          borderTopLeftRadius: sheet.topCornerRadius,
          borderTopRightRadius: sheet.topCornerRadius,
          overflow: 'hidden',
        }}
      >
        <View
          onTouchStart={(event) => {
            touchStartY.current = event.nativeEvent.pageY;
          }}
          onMoveShouldSetResponderCapture={(event) =>
            Math.abs(event.nativeEvent.pageY - touchStartY.current) >
            sheet.dragActivationDistance
          }
          onResponderGrant={() => {
            dragStartHeight.current = currentHeight.current || collapsedMax;
            setDragHeight(dragStartHeight.current);
          }}
          onResponderMove={(event) => {
            const dy = event.nativeEvent.pageY - touchStartY.current;
            setDragHeight(
              getDraggedBottomSheetHeight(dragStartHeight.current, dy, collapsedMax, expandedMax),
            );
          }}
          onResponderRelease={(event) => {
            const dy = event.nativeEvent.pageY - touchStartY.current;
            setExpanded(shouldExpandBottomSheet(expanded, dy, sheet.dragSnapDistance));
            setDragHeight(null);
          }}
          onResponderTerminate={() => setDragHeight(null)}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(expanded ? 'sheetCollapse' : 'sheetExpand')}
            accessibilityHint={t('sheetHandleHint')}
            onPress={() => setExpanded((current) => !current)}
            style={{
              minHeight: sheet.handleTouchHeight,
              justifyContent: 'center',
              alignItems: 'center',
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
                marginTop: sheet.handleTopMargin,
                marginBottom: sheet.handleBottomMargin,
              }}
            />
          </Pressable>
        </View>
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
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={{ flexShrink: 1, flexGrow: expanded || dragHeight !== null ? 1 : undefined }}
          contentContainerStyle={{ paddingBottom: sheet.contentBottomPadding }}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
