/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';
import { editDistanceWithin } from './edit-distance-within.ts';

/*
 * How many leading characters must match exactly before a fuzzy match is even
 * considered. Readers mistype the middle and end of a word, almost never its
 * first two letters — search engines call this `prefix_length`.
 */
const ANCHOR = 2;

const NONE = Number.POSITIVE_INFINITY;

const anchored = (term: string, token: string): boolean => {
  const anchor = Math.min(ANCHOR, term.length);
  return token.slice(0, anchor) === term.slice(0, anchor);
};

const lengths = (from: number, to: number): readonly number[] =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/* An exact prefix hit cannot be beaten, so the fold stops paying for the rest. */
const closer =
  (term: string, token: string, max: number) =>
  (best: number, length: number): number =>
    branch(best === 0)(
      () => 0,
      () => Math.min(best, editDistanceWithin(term, token.slice(0, length), max) ?? NONE),
    );

const bestPrefix = (term: string, token: string, max: number): number | undefined => {
  const from = Math.max(1, term.length - max);
  const best = lengths(from, Math.min(token.length, term.length + max)).reduce(
    closer(term, token, max),
    NONE,
  );
  return branch(best === NONE)<number | undefined>(
    () => undefined,
    () => best,
  );
};

/**
 * Distance from a term to the closest PREFIX of a token. Inflection is why this
 * exists: a word and its declined form are the same word wearing a different
 * ending; comparing against prefixes lets the ending diverge for free.
 * @param term - A normalized query word.
 * @param token - A normalized word from the document.
 * @param max - Edit budget.
 * @returns The best distance within budget, or undefined.
 */
export const prefixDistanceWithin = (
  term: string,
  token: string,
  max: number,
): number | undefined =>
  branch(anchored(term, token))<number | undefined>(
    () => bestPrefix(term, token, max),
    () => undefined,
  );
