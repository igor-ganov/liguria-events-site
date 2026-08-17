/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';
import { fieldScore } from './field-score.ts';
import { FIELD_WEIGHTS } from './field-weights.ts';
import { fuzzyScore } from './fuzzy-score.ts';
import type { PreparedDoc } from './prepared.ts';

const exactScore = (doc: PreparedDoc, term: string): number =>
  fieldScore(doc.title, term, FIELD_WEIGHTS.title) +
  fieldScore(doc.description, term, FIELD_WEIGHTS.description) +
  fieldScore(doc.body, term, FIELD_WEIGHTS.body);

/**
 * Score one document against one query term. A verbatim hit wins outright;
 * only a term that appears nowhere falls through to fuzzy matching.
 * @param doc - A prepared document.
 * @param term - A normalized query word.
 * @returns Score, or 0 when the term is absent — which drops the document.
 */
export const scoreTerm = (doc: PreparedDoc, term: string): number => {
  const exact = exactScore(doc, term);
  return branch(exact > 0)(
    () => exact,
    () => fuzzyScore(doc, term),
  );
};
