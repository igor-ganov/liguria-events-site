/* Vendored from @prometheus/search-core (MIT). See doc.ts for provenance. */
import { branch } from '../branch.ts';

/* A hit buried inside a longer word is worth less than a whole-word one. */
const PARTIAL = 0.6;
const WHOLE = 1;

/* Off either end of the field counts as a word boundary. */
const at = (field: string, index: number): string => field[index] ?? ' ';

const factor = (field: string, term: string, found: number): number => {
  const whole = at(field, found - 1) === ' ' && at(field, found + term.length) === ' ';
  return branch(whole)(
    () => WHOLE,
    () => PARTIAL,
  );
};

/**
 * Score one field of a document against one term.
 * @param field - The normalized field text.
 * @param term - A normalized query word.
 * @param weight - What a whole-word hit in this field is worth.
 * @returns The weighted score, or 0 when the term is absent.
 */
export const fieldScore = (field: string, term: string, weight: number): number => {
  const found = field.indexOf(term);
  return branch(found < 0)(
    () => 0,
    () => weight * factor(field, term, found),
  );
};
