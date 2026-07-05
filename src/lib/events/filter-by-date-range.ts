import type { CompactEvent } from './event-schema.ts';

/** Events whose [start, end] span overlaps the [from, to] window. An empty
 *  bound is open-ended: empty `to` means "until the very end", empty `from`
 *  means "from the very start". The same test the map and feed both use. */
export const filterByDateRange =
  (from: string, to: string) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    events.filter(
      (event) => (to === '' || event.s <= to) && (from === '' || (event.e ?? event.s) >= from),
    );
