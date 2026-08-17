import { isDefined } from '../is-defined.ts';

/** The first input matching a selector, as a list of none or one — so callers
 *  read and write its value without a guard clause. */
export const queryInput = (selector: string): readonly HTMLInputElement[] =>
  [document.querySelector<HTMLInputElement>(selector) ?? undefined].filter(isDefined);
