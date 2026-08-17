/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';
import { maxEditsFor } from './max-edits-for.ts';
import { prefixDistanceWithin } from './prefix-distance-within.ts';
import type { PreparedDoc } from './prepared.ts';

/* One term can be spelled several ways in one document; take every token within
 * budget, capped so a loose match cannot paint the whole quote. */
const MAX_FORMS = 6;

const nearTokens = (doc: PreparedDoc, term: string, budget: number): readonly string[] =>
  [...doc.tokens]
    .map((token) => ({ token, distance: prefixDistanceWithin(term, token, budget) }))
    .filter((hit) => hit.distance !== undefined)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, MAX_FORMS)
    .map((hit) => hit.token);

const fuzzyForms = (doc: PreparedDoc, term: string): readonly string[] => {
  const budget = maxEditsFor(term);
  return branch(budget === 0)<readonly string[]>(
    () => [],
    () => nearTokens(doc, term, budget),
  );
};

const formsOf = (doc: PreparedDoc) => (term: string): readonly string[] =>
  branch(doc.body.includes(term) || doc.description.includes(term))<readonly string[]>(
    () => [term],
    () => fuzzyForms(doc, term),
  );

/**
 * Every spelling of the query worth highlighting in this document: the term
 * itself when it appears verbatim, otherwise its closest tokens.
 * @param doc - A prepared document.
 * @param terms - Normalized query words.
 * @returns Normalized forms to search the folded text for.
 */
export const termForms = (doc: PreparedDoc, terms: readonly string[]): readonly string[] =>
  terms.flatMap(formsOf(doc));
