import type { Category } from './categories.ts';
import type { CompactEvent } from './event-schema.ts';

/** OR across selected categories; an event matches when ANY of its
 *  categories is selected; empty selection = everything (AC-3.2). */
export const filterByCategories =
  (selected: ReadonlySet<Category>) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter(
      (event) => selected.size === 0 || event.c.some((category) => selected.has(category)),
    );
