/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/* Typo budget by word length: a term longer than each of these limits earns
 * one more edit. Tolerance has to scale with length — one edit on a
 * three-letter word matches everything; no edits on a long word hides the
 * article a reader who cannot spell it is looking for. */
const LIMITS: readonly number[] = [3, 6, 9];

/**
 * How many edits a term of this length may absorb.
 * @param term - A normalized query word.
 * @returns Maximum edit distance that still counts as a match (0-3).
 */
export const maxEditsFor = (term: string): number =>
  LIMITS.filter((limit) => term.length > limit).length;
