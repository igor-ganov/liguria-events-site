/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */

/* Scoring, split one function per file: this is the entry point the searcher
 * imports; the parts live next to it (score-term, field-score, fuzzy-score). */
export { scoreDoc } from './score-doc.ts';
