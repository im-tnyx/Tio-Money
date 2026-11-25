import { wheelPickerTokens } from '../theme/component-tokens';

/** Signed distance is scroll position minus row index, measured in rows. */
export function wheelProjection(distance: number, rowHeight: number) {
  const { anglePerRow, maximumAngle, fadeDistance, fadePower, perspective } = wheelPickerTokens;
  const angle = distance * anglePerRow;
  const degrees = Math.max(-maximumAngle, Math.min(maximumAngle, angle));
  const radians = (degrees * Math.PI) / 180;
  const radius = rowHeight / ((anglePerRow * Math.PI) / 180);
  // All rows share a fixed radius. Depth, not an independent stretch animation,
  // determines the camera scale and the projected center.
  const depth = radius * (1 - Math.cos(radians));
  const scale = perspective / (perspective + depth);
  const centerY = -radius * Math.sin(radians) * scale;
  const edgeVisibility = Math.min(
    1,
    Math.max(0, (maximumAngle - Math.abs(angle)) / (anglePerRow / 2)),
  );
  return {
    translateY: distance * rowHeight + centerY,
    rotateX: degrees,
    opacity:
      Math.pow(Math.max(0, 1 - Math.abs(distance) / fadeDistance), fadePower) * edgeVisibility,
    scale,
  };
}

export function wheelProjectionSamples(index: number, rowHeight: number) {
  const { fadeDistance, sampleStep } = wheelPickerTokens;
  return Array.from({ length: (fadeDistance * 2) / sampleStep + 1 }, (_, sample) => {
    const distance = -fadeDistance + sample * sampleStep;
    return {
      offset: (index + distance) * rowHeight,
      ...wheelProjection(distance, rowHeight),
    };
  });
}
