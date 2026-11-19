import { Fragment } from 'react';
import { View } from 'react-native';

import type { RootTabIconName } from '@/shared/navigation/root-destinations';
import { iconTokens, tabIconShapes } from '@/shared/theme/component-tokens';
import { size } from '@/shared/theme/primitives';

/**
 * Native-drawn, font-independent tab icons.
 * A shared, token-owned icon coordinate system avoids platform-specific Unicode glyph fallback.
 * The containing tab owns the accessible label and selected state.
 */
export function RootTabIcon({ name, color }: { name: RootTabIconName; color: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: iconTokens.size, height: iconTokens.size }}
    >
      {name === 'home' && (
        <>
          <View
            style={{
              position: 'absolute',
              left: size.dp5_5,
              top: size.dp2,
              width: size.dp13,
              height: size.dp13,
              borderTopWidth: iconTokens.fineStroke,
              borderLeftWidth: iconTokens.fineStroke,
              borderColor: color,
              borderTopLeftRadius: size.dp2,
              transform: [{ rotate: iconTokens.roofRotation }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size.dp4,
              top: size.dp10,
              width: size.dp16,
              height: size.dp12,
              borderLeftWidth: iconTokens.fineStroke,
              borderRightWidth: iconTokens.fineStroke,
              borderBottomWidth: iconTokens.fineStroke,
              borderColor: color,
              borderBottomLeftRadius: size.dp2,
              borderBottomRightRadius: size.dp2,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size.dp10,
              bottom: size.dp2,
              width: size.dp4,
              height: size.dp8,
              borderLeftWidth: iconTokens.fineStroke,
              borderRightWidth: iconTokens.fineStroke,
              borderColor: color,
            }}
          />
        </>
      )}

      {name === 'transactions' &&
        tabIconShapes.transactionRows.map((top) => (
          <Fragment key={top}>
            <View
              style={{
                position: 'absolute',
                left: size.dp3,
                top,
                width: size.dp4,
                height: size.dp4,
                borderWidth: iconTokens.fineStroke,
                borderColor: color,
                borderRadius: size.dp1,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: size.dp9,
                top: top + size.dp1_5,
                width: size.dp12,
                height: iconTokens.fineStroke,
                borderRadius: size.dp1,
                backgroundColor: color,
              }}
            />
          </Fragment>
        ))}

      {name === 'statistics' &&
        tabIconShapes.statisticBars.map((bar) => (
          <View
            key={bar.left}
            style={{
              position: 'absolute',
              left: bar.left,
              bottom: size.dp3,
              width: size.dp4,
              height: bar.height,
              borderWidth: iconTokens.fineStroke,
              borderColor: color,
              borderRadius: size.dp1,
            }}
          />
        ))}

      {name === 'accounts' && (
        <>
          <View
            style={{
              position: 'absolute',
              left: size.dp2,
              top: size.dp5,
              width: size.dp20,
              height: size.dp15,
              borderWidth: iconTokens.fineStroke,
              borderColor: color,
              borderRadius: size.dp3,
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size.dp13,
              top: size.dp10,
              width: size.dp10,
              height: size.dp7,
              borderWidth: iconTokens.fineStroke,
              borderColor: color,
              borderRadius: size.dp2,
              backgroundColor: 'transparent',
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: size.dp17,
              top: size.dp12_5,
              width: size.dp2,
              height: size.dp2,
              borderRadius: size.dp1,
              backgroundColor: color,
            }}
          />
        </>
      )}

      {name === 'more' &&
        tabIconShapes.moreDots.map((left) => (
          <View
            key={left}
            style={{
              position: 'absolute',
              left,
              top: size.dp11,
              width: size.dp2,
              height: size.dp2,
              borderRadius: size.dp1,
              backgroundColor: color,
            }}
          />
        ))}
    </View>
  );
}
