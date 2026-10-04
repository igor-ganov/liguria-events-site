const channels = (hex: string): readonly number[] =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

const hexOf = (value: number): string => Math.round(value).toString(16).padStart(2, '0');

/** One opaque colour laid over another at a given strength (0 to 1), as the
 *  browser composites it: what a translucent veil actually looks like. */
export const blend = (top: string, strength: number, bottom: string): string => {
  const under = channels(bottom);
  return `#${channels(top)
    .map((value, index) => hexOf(value * strength + (under[index] ?? 0) * (1 - strength)))
    .join('')}`;
};
