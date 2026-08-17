/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import type { Mark } from './snippet-types.ts';

/**
 * Every occurrence of a needle in a haystack, as ranges.
 * @param haystack - Text to scan (folded).
 * @param needle - A non-empty form to look for.
 * @returns The ranges, in order.
 */
export const findAll = (haystack: string, needle: string): readonly Mark[] => {
  const marks: Mark[] = [];
  let at = haystack.indexOf(needle);
  while (at >= 0) {
    marks.push({ start: at, end: at + needle.length });
    at = haystack.indexOf(needle, at + needle.length);
  }
  return marks;
};
