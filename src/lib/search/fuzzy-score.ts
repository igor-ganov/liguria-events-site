/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';
import { FIELD_WEIGHTS } from './field-weights.ts';
import { maxEditsFor } from './max-edits-for.ts';
import { prefixDistanceWithin } from './prefix-distance-within.ts';
import type { PreparedDoc } from './prepared.ts';

/* A fuzzy hit is a guess. It must never outrank something spelled right. */
const PENALTY = 0.4;

const closeness = (distance: number | undefined, budget: number): number =>
  branch(distance === undefined)(
    () => 0,
    () => 1 - (distance ?? 0) / (budget + 1),
  );

/* An exact prefix hit scores 1 and cannot be beaten, so the fold stops there. */
const closest =
  (term: string, budget: number) =>
  (best: number, token: string): number =>
    branch(best === 1)(
      () => 1,
      () => Math.max(best, closeness(prefixDistanceWithin(term, token, budget), budget)),
    );

const bestToken = (doc: PreparedDoc, term: string, budget: number): number =>
  [...doc.tokens].reduce(closest(term, budget), 0);

/**
 * Score a term that appears nowhere verbatim: walk the document's unique
 * tokens, abandoning each comparison the moment it exceeds the typo budget.
 * @param doc - A prepared document.
 * @param term - A normalized query word.
 * @returns The penalised fuzzy score, or 0 when the term is too short to blur.
 */
export const fuzzyScore = (doc: PreparedDoc, term: string): number => {
  const budget = maxEditsFor(term);
  return branch(budget === 0)(
    () => 0,
    () => bestToken(doc, term, budget) * FIELD_WEIGHTS.body * PENALTY,
  );
};
