import { wheelPickerTokens } from '../theme/component-tokens';

/** Signed distance is scroll position minus row index, measured in rows. */
export function wheelProjection(distance: number, rowHeight: number) {
  const { anglePerRow, maximumAngle, fadeDistance, fadePower, minimumScale } = wheelPickerTokens;
  const degrees = Math.max(-maximumAngle, Math.min(maximumAngle, distance * anglePerRow));
  const radians = (degrees * Math.PI) / 180;
  const radius = rowHeight / ((anglePerRow * Math.PI) / 180);
  return {
    translateY: distance * rowHeight - radius * Math.sin(radians),
    rotateX: degrees,
    opacity: Math.pow(Math.max(0, 1 - Math.abs(distance) / fadeDistance), fadePower),
    scale: minimumScale + (1 - minimumScale) * Math.cos(radians),
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
