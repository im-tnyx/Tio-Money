import { Fragment } from 'react';
import { View } from 'react-native';

import type { RootTabIconName } from '@/shared/navigation/root-destinations';

/**
 * Native-drawn, font-independent tab icons.
 * A fixed 24dp coordinate system avoids platform-specific Unicode glyph fallback.
 * The containing tab owns the accessible label and selected state.
 */
export function RootTabIcon({ name, color }: { name: RootTabIconName; color: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 24, height: 24 }}
    >
      {name === 'home' && (
        <>
          <View
            style={{
              position: 'absolute',
              left: 5.5,
              top: 2,
              width: 13,
              height: 13,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderColor: color,
              borderTopLeftRadius: 2,
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 4,
              top: 10,
              width: 16,
              height: 12,
              borderLeftWidth: 2,
              borderRightWidth: 2,
              borderBottomWidth: 2,
              borderColor: color,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 10,
              bottom: 2,
              width: 4,
              height: 8,
              borderLeftWidth: 1.5,
              borderRightWidth: 1.5,
              borderColor: color,
            }}
          />
        </>
      )}

      {name === 'transactions' &&
        [4, 10, 16].map((top) => (
          <Fragment key={top}>
            <View
              style={{
                position: 'absolute',
                left: 3,
                top: top + 1,
                width: 3,
                height: 3,
                borderRadius: 1,
                backgroundColor: color,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: 9,
                top: top + 1.5,
                width: 12,
                height: 2,
                borderRadius: 1,
                backgroundColor: color,
              }}
            />
          </Fragment>
        ))}

      {name === 'statistics' && (
        <>
          {[{ left: 3, height: 8 }, { left: 10, height: 14 }, { left: 17, height: 19 }].map(
            (bar) => (
              <View
                key={bar.left}
                style={{
                  position: 'absolute',
                  left: bar.left,
                  bottom: 3,
                  width: 4,
                  height: bar.height,
                  borderRadius: 1,
                  backgroundColor: color,
                }}
              />
            ),
          )}
        </>
      )}

      {name === 'accounts' && (
        <>
          <View
            style={{
              position: 'absolute',
              left: 2,
              top: 5,
              width: 20,
              height: 15,
              borderWidth: 2,
              borderColor: color,
              borderRadius: 3,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 13,
              top: 10,
              width: 10,
              height: 7,
              borderWidth: 2,
              borderColor: color,
              borderRadius: 2,
              backgroundColor: 'transparent',
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: 17,
              top: 12.5,
              width: 2,
              height: 2,
              borderRadius: 1,
              backgroundColor: color,
            }}
          />
        </>
      )}

      {name === 'more' &&
        [3, 10, 17].map((left) => (
          <View
            key={left}
            style={{
              position: 'absolute',
              left,
              top: 10,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
        ))}
    </View>
  );
}
