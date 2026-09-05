/** How old a stored page is, as a number and a unit. */
export type Staleness = Readonly<{ value: number; unit: 'minute' | 'hour' | 'day' }>;

// Read in order, first match wins: the limit the age must be under, and the
// unit to count it in.
const SCALES: readonly (readonly [number, number, Staleness['unit']])[] = [
  [3_600_000, 60_000, 'minute'],
  [86_400_000, 3_600_000, 'hour'],
  [Infinity, 86_400_000, 'day'],
];

/**
 * The age of a page served from storage, in parts rather than in words.
 *
 * A number and a unit, because the sentence has to exist in three languages
 * and Intl.RelativeTimeFormat already writes all three. Nothing under a minute
 * is worth saying, and neither is a negative age: that is a device with the
 * wrong clock, not a page from the future.
 */
export const stalenessParts = (storedMs: number, nowMs: number): Staleness | undefined =>
  [Math.max(0, nowMs - storedMs)]
    .filter((ms) => ms >= 60_000)
    .flatMap((ms) => SCALES.filter(([limit]) => ms < limit).map(([, size, unit]) => ({ value: Math.floor(ms / size), unit })))
    .at(0);
