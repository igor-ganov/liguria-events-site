/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { foldWithMap } from './fold.ts';

/**
 * Fold a string into the alphabet the index and the query share.
 * @param raw - Any user- or content-supplied text.
 * @returns Lower-case, diacritic-free, single-spaced text.
 */
export const normalize = (raw: string): string => foldWithMap(raw).text.trim();

/**
 * Split text into searchable words, normalising first.
 * @param raw - Any user- or content-supplied text.
 * @returns Words, in order; empty for text with no letters or digits.
 */
export const tokenize = (raw: string): readonly string[] => {
  const normalized = normalize(raw);
  return normalized === '' ? [] : normalized.split(' ');
};
