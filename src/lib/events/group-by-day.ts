import type { CompactEvent } from './event-schema.ts';
import { isUpcoming } from './is-upcoming.ts';
import { maxIso } from './max-iso.ts';
import { sortByStart } from './sort-by-start.ts';

/**
 * Feed grouping (AC-3.1): upcoming events keyed by their display day —
 * the start date, or today for already-running multi-day events. Map
 * insertion order follows the sorted input, so entries iterate ascending.
 */
export const groupByDay =
  (today: string) =>
  (events: readonly CompactEvent[]): ReadonlyMap<string, readonly CompactEvent[]> => {
    const upcoming = sortByStart(events.filter(isUpcoming(today)));
    return upcoming.reduce((groups, event) => {
      const day = maxIso(event.s, today);
      return new Map(groups).set(day, [...(groups.get(day) ?? []), event]);
    }, new Map<string, readonly CompactEvent[]>());
  };
