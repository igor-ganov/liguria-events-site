/** A value as a real number: anything that is not a finite number — a string, a
 *  boolean, NaN, an infinity, an absent field — reads as nothing. The branch-free
 *  stand-in for `typeof v === 'number' && Number.isFinite(v) ? v : undefined`. */
export const finiteNumber = (value: unknown): number | undefined =>
  [value].filter((candidate): candidate is number => typeof candidate === 'number' && Number.isFinite(candidate)).at(0);
