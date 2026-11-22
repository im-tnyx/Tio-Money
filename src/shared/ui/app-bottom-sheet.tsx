import { useRef, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  hasOverflowingSheetContent,
  shouldExpandBottomSheet,
} from './bottom-sheet-geometry';

/** Visibility/dismissal remains owned by callers. Unmount resets local drag state. */
export function AppBottomSheet({
  visible,
  title,
  dismissAccessibilityLabel,
  onDismiss,
  children,
  avoidKeyboard = false,
}: {
  visible: boolean;
  title: string;
  dismissAccessibilityLabel: string;
  onDismiss: () => void;
  children: ReactNode;
  avoidKeyboard?: boolean;
}) {
  const surface = visible ? (
    <SheetSurface
      key={title}
      title={title}
      dismissAccessibilityLabel={dismissAccessibilityLabel}
      onDismiss={onDismiss}
    >
      {children}
    </SheetSurface>
  ) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {surface}
        </KeyboardAvoidingView>
      ) : (
        surface
      )}
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
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [viewportHeight, setViewportHeight] = useState(windowHeight);
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const currentHeight = useRef(0);
  const dragStartHeight = useRef(0);

  const limits = getBottomSheetHeightLimits(viewportHeight, topInset, sheet);
  const { collapsedMax, expandedMax } = limits;
  // The handle/title never move. Measure only the choices: short sheets stay
  // content-sized at the bottom; overflowing lists may expand when dragged.
  const chromeHeight =
    sheet.handleHeight +
    sheet.handleTopMargin +
    sheet.handleBottomMargin +
    sheet.headerMinHeight +
    sheet.headerDividerWidth +
    bottomInset;
  const collapsedContentMaxHeight = Math.max(0, collapsedMax - chromeHeight);
  const canExpand = hasOverflowingSheetContent(contentHeight, collapsedContentMaxHeight);
  // SafeAreaView already supplies OS bottom padding. Do not add it again to
  // the list, or short Decimal/Format sheets rise above their content height.
  const scrollBottomPadding = canExpand ? sheet.contentBottomPadding : theme.navigation.origin;
  const expandedForContent = canExpand && expanded;
  const draggedForContent = canExpand ? dragHeight : null;
  const visibleMaxHeight = draggedForContent ?? (expandedForContent ? expandedMax : collapsedMax);
  const contentMaxHeight = Math.max(0, visibleMaxHeight - chromeHeight);
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
          maxHeight: draggedForContent === null && !expandedForContent ? collapsedMax : expandedMax,
          height: draggedForContent ?? (expandedForContent ? expandedMax : undefined),
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
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          scrollEnabled={hasOverflowingSheetContent(contentHeight, contentMaxHeight)}
          onContentSizeChange={(_width, height) => {
            setContentHeight((previous) => (previous === height ? previous : height));
          }}
          style={{
            flexShrink: 1,
            flexGrow: expandedForContent || draggedForContent !== null ? 1 : 0,
            maxHeight: contentMaxHeight,
          }}
          contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        >
          {children}
        </ScrollView>
        {canExpand ? (
          <View
            onTouchStart={(event) => {
              touchStartY.current = event.nativeEvent.pageY;
            }}
            onMoveShouldSetResponderCapture={(event) => {
              const dy = event.nativeEvent.pageY - touchStartY.current;
              return Math.abs(dy) > sheet.dragActivationDistance;
            }}
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
            style={{
              position: 'absolute',
              top: theme.navigation.origin,
              width: sheet.handleTouchWidth,
              height: sheet.handleTouchHeight,
              alignSelf: 'center',
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(expandedForContent ? 'sheetCollapse' : 'sheetExpand')}
              accessibilityHint={t('sheetHandleHint')}
              onPress={() => setExpanded((current) => !current)}
              style={{ flex: 1 }}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
