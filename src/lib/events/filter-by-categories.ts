import type { Category } from './categories.ts';
import type { CompactEvent } from './event-schema.ts';

/** OR across selected categories; empty selection = everything (AC-3.2). */
export const filterByCategories =
  (selected: ReadonlySet<Category>) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter((event) => selected.size === 0 || selected.has(event.c));
