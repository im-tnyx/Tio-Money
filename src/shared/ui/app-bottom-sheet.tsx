import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
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
import Svg, { Path } from 'react-native-svg';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';
import {
  getBottomSheetHeightLimits,
  getDraggedBottomSheetHeight,
  hasOverflowingSheetContent,
  shouldExpandBottomSheet,
} from './bottom-sheet-geometry';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

export interface BottomSheetLayer {
  readonly title: string;
  readonly dismissAccessibilityLabel: string;
  readonly onDismiss: () => void;
  readonly showCloseButton?: boolean;
  readonly expandable?: boolean;
  readonly children: ReactNode;
}

/** Visibility and the optional top layer remain owned by callers. */
export function AppBottomSheet({
  visible,
  title,
  dismissAccessibilityLabel,
  onDismiss,
  animate = true,
  children,
  avoidKeyboard = false,
  showCloseButton,
  expandable,
  overlay,
  slideInOnMount = false,
}: BottomSheetLayer & {
  visible: boolean;
  animate?: boolean;
  avoidKeyboard?: boolean;
  overlay?: BottomSheetLayer;
  slideInOnMount?: boolean;
}) {
  const renderLayer = (layer: BottomSheetLayer, animateEntrance = false) => (
    <SheetSurface
      key={layer.title}
      {...layer}
      animateEntrance={animateEntrance}
      underlayBehindKeyboard={avoidKeyboard && Platform.OS === 'ios'}
      keyboardAvoiding={avoidKeyboard}
    />
  );
  const surface = visible ? (
    <>
      <View
        style={{ flex: 1 }}
        pointerEvents={overlay ? 'none' : 'auto'}
        accessibilityElementsHidden={overlay !== undefined}
        importantForAccessibility={overlay ? 'no-hide-descendants' : 'auto'}
      >
        {renderLayer(
          { title, dismissAccessibilityLabel, onDismiss, showCloseButton, expandable, children },
          animate && slideInOnMount,
        )}
      </View>
      {overlay ? <View style={StyleSheet.absoluteFill}>{renderLayer(overlay)}</View> : null}
    </>
  ) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animate ? 'slide' : 'none'}
      onRequestClose={overlay?.onDismiss ?? onDismiss}
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
  showCloseButton,
  expandable,
  animateEntrance,
  underlayBehindKeyboard,
  keyboardAvoiding,
}: BottomSheetLayer & {
  animateEntrance: boolean;
  underlayBehindKeyboard: boolean;
  keyboardAvoiding: boolean;
}) {
  const theme = useAppTheme();
  const sheet = theme.bottomSheet;
  const { height: windowHeight } = useWindowDimensions();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const [viewportHeight, setViewportHeight] = useState(windowHeight);
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [entranceOffset] = useState(() =>
    animateEntrance ? new Animated.Value(windowHeight) : null,
  );
  const [entranceReady, setEntranceReady] = useState(false);
  const currentHeight = useRef(0);
  const dragStartHeight = useRef(0);

  // Let long forms expand in a full viewport and use all available room above the keyboard.
  const skipCollapsedCap = keyboardAvoiding && (!expandable || viewportHeight < windowHeight);
  const limits = getBottomSheetHeightLimits(viewportHeight, topInset, sheet, skipCollapsedCap);
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
  const hasCollapsedOverflow = hasOverflowingSheetContent(contentHeight, collapsedContentMaxHeight);
  const canExpand = hasCollapsedOverflow && expandedMax > collapsedMax;
  // SafeAreaView already supplies OS bottom padding. Do not add it again to
  // the list, or short Decimal/Format sheets rise above their content height.
  const scrollBottomPadding = hasCollapsedOverflow
    ? sheet.contentBottomPadding
    : theme.navigation.origin;
  const expandedForContent = canExpand && expanded;
  const draggedForContent = canExpand ? dragHeight : null;
  const visibleMaxHeight = draggedForContent ?? (expandedForContent ? expandedMax : collapsedMax);
  const contentMaxHeight = Math.max(0, visibleMaxHeight - chromeHeight);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (!entranceOffset) return;
    if (!animateEntrance) {
      entranceOffset.setValue(0);
      return;
    }
    if (!entranceReady) return;

    const entrance = Animated.timing(entranceOffset, {
      toValue: 0,
      duration: sheet.entranceDurationMs,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    entrance.start();
    return () => entrance.stop();
  }, [animateEntrance, entranceOffset, entranceReady, sheet.entranceDurationMs]);

  useEffect(() => {
    if (!underlayBehindKeyboard) return;

    const updateHeight = (event: { endCoordinates: { height: number } }) => {
      setKeyboardHeight(Math.max(0, event.endCoordinates.height));
    };
    // iOS keyboard corners/translucency reveal the pixels behind the native keyboard.
    // Only the background extends under it; KeyboardAvoidingView still lifts the form.
    const show = Keyboard.addListener('keyboardWillShow', updateHeight);
    const frame = Keyboard.addListener('keyboardWillChangeFrame', updateHeight);
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

    return () => {
      show.remove();
      frame.remove();
      hide.remove();
    };
  }, [underlayBehindKeyboard]);

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
        accessible={!showCloseButton}
        importantForAccessibility={showCloseButton ? 'no' : 'auto'}
        accessibilityRole="button"
        accessibilityLabel={dismissAccessibilityLabel}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.shadow, opacity: sheet.backdropOpacity },
        ]}
      />
      {underlayBehindKeyboard && keyboardHeight > 0 ? (
        <View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={{
            position: 'absolute',
            left: theme.navigation.origin,
            right: theme.navigation.origin,
            bottom: -keyboardHeight,
            height: keyboardHeight,
            backgroundColor: theme.colors.card,
          }}
        />
      ) : null}
      <AnimatedSafeAreaView
        edges={['bottom', 'left', 'right']}
        accessibilityViewIsModal
        onAccessibilityEscape={onDismiss}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          currentHeight.current = height;
          // Wait until layout so the sheet starts just below its resting position.
          if (entranceOffset && !entranceReady && height > 0) {
            if (animateEntrance) entranceOffset.setValue(height);
            setEntranceReady(true);
          }
        }}
        style={{
          width: '100%',
          transform:
            entranceOffset && animateEntrance ? [{ translateY: entranceOffset }] : undefined,
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
            paddingHorizontal: showCloseButton
              ? theme.buttons.minimumHeight
              : sheet.headerHorizontalPadding,
            borderBottomWidth: sheet.headerDividerWidth,
            borderBottomColor: theme.colors.border,
          }}
        >
          <AppText variant="section" style={{ flex: 1, textAlign: 'center' }}>
            {title}
          </AppText>
          {showCloseButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={dismissAccessibilityLabel}
              onPress={onDismiss}
              style={{
                position: 'absolute',
                right: theme.navigation.origin,
                width: theme.buttons.minimumHeight,
                minHeight: theme.buttons.minimumHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg
                width={theme.iconRoles.bottomSheet}
                height={theme.iconRoles.bottomSheet}
                viewBox="0 0 24 24"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Path
                  d="m6 6 12 12M18 6 6 18"
                  fill="none"
                  stroke={theme.colors.primaryText}
                  strokeWidth={theme.icons.stroke}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          ) : null}
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
      </AnimatedSafeAreaView>
    </View>
  );
}
