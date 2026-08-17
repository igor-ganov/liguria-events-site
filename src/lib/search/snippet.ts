/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/* Snippetting, split one function per file: this is the entry point the
 * searcher imports; the parts live next to it (term-forms, find-all,
 * word-edge, quote-around). */
export type { Mark, Snippet } from './snippet-types.ts';
export { buildSnippet } from './build-snippet.ts';
