import { isUpcoming } from '../events/is-upcoming.ts';
import { regionOf } from './region-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/**
 * The region with the most events still to come.
 *
 * What to open for a reader whose own region we do not know — a crawler, or
 * anybody outside Italy. It follows the corpus rather than the site's history:
 * Lombardia carries 536 of the 1 583 events today, and Liguria, which the site
 * is named after, is third.
 */
export const busiestRegion = (
  events: readonly CompactEvent[],
  today: string,
): string | undefined => {
  const counts = events.filter(isUpcoming(today)).reduce((tally, event) => {
    const region = regionOf(event);
    return tally.set(region, (tally.get(region) ?? 0) + 1);
  }, new Map<string, number>());
  return [...counts.entries()].toSorted(([, left], [, right]) => right - left).at(0)?.[0];
};
