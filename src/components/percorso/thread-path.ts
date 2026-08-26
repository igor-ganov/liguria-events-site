const STRETCH = 120;
const LANE = 9;
const SWAY = 3.4;

/** Consecutive stretches lean opposite ways, so the line never settles. */
const swayAt = (index: number): number => [SWAY, -SWAY][index % 2] ?? SWAY;

const stretchOf =
  (height: number, count: number) =>
  (_unused: unknown, index: number): string => {
    const middle = ((index + 0.5) * height) / count;
    const end = ((index + 1) * height) / count;
    return `C${LANE + swayAt(index)},${middle} ${LANE - swayAt(index)},${middle} ${LANE},${end}`;
  };

/**
 * The thread, as SVG path data for a 18px-wide lane of the given height.
 * It is not straight: it wanders a few pixels either side, the way a line
 * pulled by hand on paper does not hold still.
 */
export const threadPath = (height: number): string => {
  const count = Math.max(2, Math.round(height / STRETCH));
  return `M${LANE},0 ${Array.from({ length: count }, stretchOf(height, count)).join(' ')}`;
};
