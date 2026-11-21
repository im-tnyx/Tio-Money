import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  PanResponder,
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

/**
 * One scrollable modal shell for every feature. Presentation-only expansion
 * is local; callers still own visibility, selection and dismiss actions.
 */
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
  const { height: windowHeight } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();
  const [viewportHeight, setViewportHeight] = useState(windowHeight);
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const currentHeight = useRef(0);
  const dragStartHeight = useRef(0);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  const { collapsedMax, expandedMax } = getBottomSheetHeightLimits(
    viewportHeight,
    topInset,
    sheet,
  );
  const geometryRef = useRef({ collapsedMax, expandedMax, sheet });
  geometryRef.current = { collapsedMax, expandedMax, sheet };

  useEffect(() => {
    if (!visible) {
      setExpanded(false);
      setDragHeight(null);
    }
  }, [visible]);

  // Only the handle captures drags; list swipes stay native ScrollView gestures.
  const handleResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dy) > geometryRef.current.sheet.dragActivationDistance &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => {
          dragStartHeight.current = currentHeight.current || geometryRef.current.collapsedMax;
          setDragHeight(dragStartHeight.current);
        },
        onPanResponderMove: (_event, gesture) => {
          const { collapsedMax: min, expandedMax: max } = geometryRef.current;
          setDragHeight(
            getDraggedBottomSheetHeight(dragStartHeight.current, gesture.dy, min, max),
          );
        },
        onPanResponderRelease: (_event, gesture) => {
          setExpanded(
            shouldExpandBottomSheet(
              expandedRef.current,
              gesture.dy,
              geometryRef.current.sheet.dragSnapDistance,
            ),
          );
          setDragHeight(null);
        },
        onPanResponderTerminate: () => setDragHeight(null),
      }),
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
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
    </Modal>
  );
}
