import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/theme/theme-provider';

import {
  popupPosition,
  type PopupAlign,
  type PopupAnchor,
  type PopupPlacement,
} from './popup-position';

/** Controlled popup: only native anchor geometry is local presentation state. */
export function AppPopupCard({
  trigger,
  label,
  value,
  dismissLabel,
  open,
  onOpen,
  onClose,
  preferredWidth,
  preferredHeight,
  minimumHeight = 0,
  placement = 'auto',
  align = 'end',
  alignOffset = 0,
  children,
}: {
  readonly trigger: ReactNode;
  readonly label: string;
  readonly value: string;
  readonly dismissLabel: string;
  readonly open: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly preferredWidth: number;
  readonly preferredHeight: number;
  readonly minimumHeight?: number;
  readonly placement?: PopupPlacement;
  readonly align?: PopupAlign;
  readonly alignOffset?: number;
  readonly children: ReactNode | ((availableContentHeight: number) => ReactNode);
}) {
  const theme = useAppTheme();
  const viewport = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ref = useRef<ComponentRef<typeof Pressable>>(null);
  const [anchor, setAnchor] = useState<PopupAnchor | null>(null);
  const margin = theme.space.xs;
  const safeWidth = Math.max(0, viewport.width - insets.left - insets.right - margin * 2);
  const safeHeight = Math.max(0, viewport.height - insets.top - insets.bottom - margin * 2);
  const width = Math.min(preferredWidth, safeWidth);
  const height = Math.min(preferredHeight, safeHeight);
  const settings = {
    margin,
    gap: theme.space.xxs,
    preferredWidth: width,
    preferredHeight: height,
    placement,
    align,
    alignOffset,
  };

  function measure(requestOpen = false) {
    ref.current?.measureInWindow((x, y, width, height) => {
      const next = width > 0 && height > 0 ? { x, y, width, height } : null;
      setAnchor(next);
      if (!next) return;
      if (
        placement === 'above' &&
        popupPosition(next, viewport, insets, settings).maxHeight < minimumHeight
      ) {
        if (!requestOpen) onClose();
        return;
      }
      if (requestOpen) onOpen();
    });
  }

  const anchored = anchor ? popupPosition(anchor, viewport, insets, settings) : undefined;
  // Above-only cards never flip or fall back to the viewport center.
  const position =
    placement === 'above'
      ? anchored
      : anchored && anchored.maxHeight >= height
        ? anchored
        : {
            width,
            left: insets.left + margin + (safeWidth - width) / 2,
            top: insets.top + margin + (safeHeight - height) / 2,
            maxHeight: safeHeight,
          };
  const availableHeight = position ? Math.min(height, position.maxHeight) : 0;
  const availableContentHeight = Math.max(0, availableHeight - theme.navigation.borderWidth * 2);

  return (
    <>
      <Pressable
        ref={ref}
        collapsable={false}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value }}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          if (placement === 'above') measure(true);
          else {
            measure();
            onOpen();
          }
        }}
      >
        {trigger}
      </Pressable>
      {open ? (
        <Modal
          transparent
          presentationStyle="overFullScreen"
          statusBarTranslucent
          navigationBarTranslucent
          onShow={() => measure()}
          onRequestClose={onClose}
        >
          <View style={{ flex: 1 }} accessibilityViewIsModal onAccessibilityEscape={onClose}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={dismissLabel}
              style={StyleSheet.absoluteFill}
              onPress={onClose}
            />
            {position && availableHeight >= minimumHeight ? (
              <View
                style={{
                  position: 'absolute',
                  ...position,
                  maxHeight: availableHeight,
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
                {typeof children === 'function' ? children(availableContentHeight) : children}
              </View>
            ) : null}
          </View>
        </Modal>
      ) : null}
    </>
  );
}
