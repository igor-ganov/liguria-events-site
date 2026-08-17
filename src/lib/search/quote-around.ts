/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';
import { wordEdge } from './word-edge.ts';
import type { Mark, Snippet } from './snippet-types.ts';

/* How much text to keep either side of the first hit. */
const RADIUS = 90;

const START: Mark = { start: 0, end: 0 };

const quoted = (source: string, first: Mark): Readonly<{ text: string; offset: number }> => {
  const from = wordEdge(source, Math.max(0, first.start - RADIUS), false);
  const to = wordEdge(source, Math.min(source.length, first.end + RADIUS), true);
  const cut = source.slice(from, to);
  return { text: cut.trim(), offset: from + (cut.length - cut.trimStart().length) };
};

const around = (source: string, hits: readonly Mark[]): Snippet => {
  const { text, offset } = quoted(source, hits[0] ?? START);
  const marks = hits
    .map((hit) => ({ start: hit.start - offset, end: hit.end - offset }))
    .filter((mark) => mark.start >= 0 && mark.end <= text.length);
  return { text, marks };
};

/**
 * Quote the document around its first hit, with the hits re-based onto the
 * quote. With no hits at all, quote the opening instead.
 * @param source - The document text the hits point into.
 * @param hits - Ranges in `source`, sorted by start.
 * @returns The quote and the ranges that fall inside it.
 */
export const quoteAround = (source: string, hits: readonly Mark[]): Snippet =>
  branch(hits.length === 0)<Snippet>(
    () => ({ text: source.slice(0, RADIUS * 2).trim(), marks: [] }),
    () => around(source, hits),
  );
