import { parseCategories } from './parse-categories.ts';

/** The row's categories, falling back to the catch-all so every event carries at
 *  least one and no card renders an empty tag row. */
export const eventCategories = (raw: string | null): readonly string[] =>
  [parseCategories(raw)].filter((list) => list.length > 0).at(0) ?? ['other'];
