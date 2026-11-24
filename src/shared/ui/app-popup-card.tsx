import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { popupPosition, type PopupAnchor } from './popup-position';

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
  readonly children: ReactNode;
}) {
  const theme = useAppTheme();
  const viewport = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ref = useRef<ComponentRef<typeof Pressable>>(null);
  const [anchor, setAnchor] = useState<PopupAnchor | null>(null);
  const measure = () => {
    ref.current?.measureInWindow((x, y, width, height) => {
      setAnchor(width > 0 && height > 0 ? { x, y, width, height } : null);
    });
  };
  const margin = theme.space.xs;
  const safeWidth = Math.max(0, viewport.width - insets.left - insets.right - margin * 2);
  const safeHeight = Math.max(0, viewport.height - insets.top - insets.bottom - margin * 2);
  const width = Math.min(preferredWidth, safeWidth);
  const height = Math.min(preferredHeight, safeHeight);
  const anchored = anchor
    ? popupPosition(anchor, viewport, insets, {
        margin,
        gap: theme.space.xxs,
        preferredWidth: width,
        preferredHeight: height,
      })
    : undefined;
  // If neither side fits, center the complete wheel within the safe viewport.
  const position =
    anchored && anchored.maxHeight >= height
      ? anchored
      : {
          width,
          left: insets.left + margin + (safeWidth - width) / 2,
          top: insets.top + margin + (safeHeight - height) / 2,
          maxHeight: safeHeight,
        };

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
          measure();
          onOpen();
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
          onShow={measure}
          onRequestClose={onClose}
        >
          <View style={{ flex: 1 }} accessibilityViewIsModal onAccessibilityEscape={onClose}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={dismissLabel}
              style={StyleSheet.absoluteFill}
              onPress={onClose}
            />
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
              {children}
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}
