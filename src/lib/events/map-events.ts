import type { Category } from './categories.ts';
import type { CompactEvent } from './event-schema.ts';

/** Located events matching the selected categories and overlapping [from, to]. */
export const mapEvents =
  (from: string, to: string, selected: readonly Category[]) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events
      .filter((event) => event.g !== undefined)
      .filter((event) => selected.length === 0 || event.c.some((c) => selected.includes(c)))
      .filter((event) => event.s <= to && (event.e ?? event.s) >= from);
