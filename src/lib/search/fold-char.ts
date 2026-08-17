/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/* Combining marks left behind by the NFD decomposition. */
const COMBINING = /\p{M}+/gu;

/*
 * `й` is a LETTER, not an accented `и` — but NFD decomposes it into `и` plus a
 * combining breve, and the strip below would then eat it. `ё → е` is the
 * opposite case, and deliberate: a spelling variant readers substitute freely.
 * Both are exceptions to the strip, so both are a lookup rather than a branch.
 */
const EXCEPTIONS = new Map<string, string>([
  ['ё', 'е'],
  ['й', 'й'],
]);

/** Fold one character: lower-cased, with its accents stripped. */
export const foldChar = (ch: string): string => {
  const lower = ch.toLowerCase();
  return EXCEPTIONS.get(lower) ?? lower.normalize('NFD').replace(COMBINING, '');
};
