import type { CompactEvent } from './event-schema.ts';

/** Events whose [start, end] span overlaps the inclusive [from, to] window —
 *  the same test the map uses, so feed and map always agree. */
export const filterByDateRange =
  (from: string, to: string) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter((event) => event.s <= to && (event.e ?? event.s) >= from);
