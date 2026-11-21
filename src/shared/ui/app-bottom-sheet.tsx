import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type PanResponderGestureState,
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
  const expandedRef = useRef(expanded);

  const { collapsedMax, expandedMax } = getBottomSheetHeightLimits(
    viewportHeight,
    topInset,
    sheet,
  );
  const geometryRef = useRef({ collapsedMax, expandedMax, sheet });

  // Only event handlers read refs, never the render path.
  useEffect(() => {
    expandedRef.current = expanded;
    geometryRef.current = { collapsedMax, expandedMax, sheet };
  }, [expanded, collapsedMax, expandedMax, sheet]);

  const shouldHandleDrag = useCallback(
    (_event: GestureResponderEvent, gesture: PanResponderGestureState) =>
      Math.abs(gesture.dy) > geometryRef.current.sheet.dragActivationDistance &&
      Math.abs(gesture.dy) > Math.abs(gesture.dx),
    [],
  );
  const onDragStart = useCallback(() => {
    dragStartHeight.current = currentHeight.current || geometryRef.current.collapsedMax;
    setDragHeight(dragStartHeight.current);
  }, []);
  const onDragMove = useCallback(
    (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
      const { collapsedMax: min, expandedMax: max } = geometryRef.current;
      setDragHeight(
        getDraggedBottomSheetHeight(dragStartHeight.current, gesture.dy, min, max),
      );
    },
    [],
  );
  const onDragRelease = useCallback(
    (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
      setExpanded(
        shouldExpandBottomSheet(
          expandedRef.current,
          gesture.dy,
          geometryRef.current.sheet.dragSnapDistance,
        ),
      );
      setDragHeight(null);
    },
    [],
  );
  const onDragTerminate = useCallback(() => setDragHeight(null), []);

  // The handle captures drags; options keep native vertical scrolling.
  const handleResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: shouldHandleDrag,
        onPanResponderGrant: onDragStart,
        onPanResponderMove: onDragMove,
        onPanResponderRelease: onDragRelease,
        onPanResponderTerminate: onDragTerminate,
      }),
    [shouldHandleDrag, onDragStart, onDragMove, onDragRelease, onDragTerminate],
  );

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
        <View {...handleResponder.panHandlers}>
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
