/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { normalize } from './normalize.ts';

/**
 * Split text into searchable words, normalising first.
 * @param raw - Any user- or content-supplied text.
 * @returns Words, in order; empty for text with no letters or digits.
 */
export const tokenize = (raw: string): readonly string[] =>
  normalize(raw)
    .split(' ')
    .filter((word) => word !== '');
