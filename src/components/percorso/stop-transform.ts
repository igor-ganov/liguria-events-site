/** Places a stop on the lane at the given height, centred on the line. */
export const stopTransform = (y: number): string => `translate(2,${Math.round(y) - 7})`;
