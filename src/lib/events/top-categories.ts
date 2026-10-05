import { CATEGORIES } from './categories.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Ui } from '../i18n/ui-schema.ts';

/** Three. A page that lists all ten of its categories has named none of them. */
const NAMED = 3;

/**
 * What kind of events these are, the commonest first.
 *
 * "other" is left out: it is the bin for everything the extractor could not
 * place, and naming it says nothing about the town.
 */
export const topCategories = (events: readonly CompactEvent[], ui: Ui): readonly string[] => {
  const tally = events
    .flatMap((event) => event.c)
    .filter((category) => category !== 'other')
    .reduce((counts, category) => counts.set(category, (counts.get(category) ?? 0) + 1), new Map<string, number>());
  return [...tally.entries()]
    .toSorted(([left, leftCount], [right, rightCount]) =>
      rightCount - leftCount || CATEGORIES.indexOf(left as never) - CATEGORIES.indexOf(right as never),
    )
    .slice(0, NAMED)
    .map(([category]) => ui.cat[category as keyof Ui['cat']] ?? category);
};
