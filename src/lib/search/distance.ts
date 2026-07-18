/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/*
 * Bounded Levenshtein. The scorer runs this against every unique token of every
 * document, so the bound is what makes the whole approach affordable.
 */

/** Typo budget by word length; see {@link maxEditsFor}. */
const SHORT = 3;
const MEDIUM = 6;
const LONG = 9;

/**
 * How many edits a term of this length may absorb. Tolerance scales with
 * length: one edit on a three-letter word matches everything; no edits on a
 * long word hides the article a reader who cannot spell it is looking for.
 * @param term - A normalized query word.
 * @returns Maximum edit distance that still counts as a match.
 */
export const maxEditsFor = (term: string): number => {
  if (term.length <= SHORT) return 0;
  if (term.length <= MEDIUM) return 1;
  return term.length <= LONG ? 2 : 3;
};

/**
 * Edit distance between two words, abandoned as soon as it exceeds `max`.
 * @param a - First word (normalized).
 * @param b - Second word (normalized).
 * @param max - Bound; beyond it the answer is not worth computing.
 * @returns The distance, or undefined when it exceeds `max`.
 */
export const editDistanceWithin = (
  a: string,
  b: string,
  max: number,
): number | undefined => {
  if (Math.abs(a.length - b.length) > max) return undefined;
  if (a === b) return 0;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i, ...new Array<number>(b.length).fill(0)];
    let best = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        (row[j - 1] ?? 0) + 1,
        (prev[j] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
      row[j] = value;
      best = Math.min(best, value);
    }
    /* Every path through this row already costs more than the bound. */
    if (best > max) return undefined;
    prev = row;
  }
  const distance = prev[b.length] ?? Number.POSITIVE_INFINITY;
  return distance > max ? undefined : distance;
};

/*
 * How many leading characters must match exactly before a fuzzy match is even
 * considered. Readers mistype the middle and end of a word, almost never its
 * first two letters — search engines call this `prefix_length`.
 */
const ANCHOR = 2;

/**
 * Distance from a term to the closest PREFIX of a token. Inflection is why this
 * exists: «искусственный» and «искусственного» are the same word wearing a
 * different ending; comparing against prefixes lets the ending diverge for free.
 * @param term - A normalized query word.
 * @param token - A normalized word from the document.
 * @param max - Edit budget.
 * @returns The best distance within budget, or undefined.
 */
export const prefixDistanceWithin = (
  term: string,
  token: string,
  max: number,
): number | undefined => {
  const anchor = Math.min(ANCHOR, term.length);
  if (token.slice(0, anchor) !== term.slice(0, anchor)) return undefined;
  const shortest = Math.max(1, term.length - max);
  const longest = Math.min(token.length, term.length + max);
  let best: number | undefined;
  for (let length = shortest; length <= longest; length += 1) {
    const distance = editDistanceWithin(term, token.slice(0, length), max);
    if (distance === undefined) continue;
    if (distance === 0) return 0;
    best = best === undefined ? distance : Math.min(best, distance);
  }
  return best;
};
