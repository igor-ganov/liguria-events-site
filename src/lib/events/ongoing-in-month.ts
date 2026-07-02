import type { CompactEvent } from './event-schema.ts';
import { isLongRunning } from './is-long-running.ts';
import { sortByStart } from './sort-by-start.ts';

/** Long-running events overlapping the displayed month (AC-2.3). */
export const ongoingInMonth =
  (monthKey: string) =>
  (events: readonly CompactEvent[]): readonly CompactEvent[] =>
    sortByStart(
      events.filter(
        (event) =>
          isLongRunning(event) &&
          event.s <= `${monthKey}-31` &&
          (event.e ?? event.s) >= `${monthKey}-01`,
      ),
    );
