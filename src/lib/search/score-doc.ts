/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';
import { scoreTerm } from './score-term.ts';
import type { PreparedDoc } from './prepared.ts';

/* undefined is the dead accumulator: once a term missed, the document is out
 * and the remaining terms are never scored. */
const add = (total: number, score: number): number | undefined =>
  branch(score === 0)<number | undefined>(
    () => undefined,
    () => total + score,
  );

const step =
  (doc: PreparedDoc) =>
  (total: number | undefined, term: string): number | undefined =>
    branch(total === undefined)<number | undefined>(
      () => undefined,
      () => add(total ?? 0, scoreTerm(doc, term)),
    );

/**
 * Score one document against the whole query. Every term must land somewhere
 * (AND, not OR): a reader who types two words means both.
 * @param doc - A prepared document.
 * @param terms - Normalized query words.
 * @returns Total score, or 0 when any term is missing.
 */
export const scoreDoc = (doc: PreparedDoc, terms: readonly string[]): number =>
  terms.reduce<number | undefined>(step(doc), 0) ?? 0;
