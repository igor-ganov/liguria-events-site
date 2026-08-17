/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';
import { findAll } from './find-all.ts';
import { foldWithMap } from './fold.ts';
import { quoteAround } from './quote-around.ts';
import { termForms } from './term-forms.ts';
import type { Mark, Snippet } from './snippet-types.ts';
import type { PreparedDoc } from './prepared.ts';

/* A document with an empty body is quoted from its description instead. */
const sourceOf = (doc: PreparedDoc): string =>
  branch(doc.doc.body.trim() === '')(
    () => doc.doc.description,
    () => doc.doc.body,
  );

/* The fold does not preserve offsets, so every hit is mapped back to a range
 * in the SOURCE before it is quoted. */
const toSource = (map: readonly number[]) => (mark: Mark): Mark => ({
  start: map[mark.start] ?? 0,
  end: (map[mark.end - 1] ?? 0) + 1,
});

/**
 * Quote the document around the first term that appears in it, and say where
 * inside that quote the query landed.
 * @param doc - A prepared document.
 * @param terms - Normalized query words.
 * @returns A quote plus the ranges inside it that matched.
 */
export const buildSnippet = (doc: PreparedDoc, terms: readonly string[]): Snippet => {
  const source = sourceOf(doc);
  const { text: folded, map } = foldWithMap(source);
  const hits = termForms(doc, terms)
    .flatMap((form) => findAll(folded, form))
    .map(toSource(map))
    .sort((a, b) => a.start - b.start);
  return quoteAround(source, hits);
};
