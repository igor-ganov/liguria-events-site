import { isUpcoming } from '../events/is-upcoming.ts';
import { regionName } from './region-name.ts';
import { regionOf } from './region-of.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/** A region worth offering on the front page, and the next thing happening in
 *  it. */
export type EntryPick = Readonly<{
  region: string;
  name: string;
  count: number;
  event: CompactEvent;
}>;

const soonest = (events: readonly CompactEvent[]): CompactEvent | undefined =>
  events.toSorted((left, right) => left.s.localeCompare(right.s)).at(0);

/**
 * What the front page shows instead of guessing where the reader is: the next
 * event in each of the busiest regions, a handful of them.
 *
 * A reader who has named no region is not asked to pick a name off a list of
 * twenty — they are shown what is actually on, in several parts of the country,
 * and the question answers itself. It is also the only landing a crawler can
 * read: `/` has been a redirect since the site began, and a redirect is not a
 * page anybody can be shown in a result.
 */
export const entryPicks = (
  events: readonly CompactEvent[],
  today: string,
  max: number,
): readonly EntryPick[] => {
  const ahead = events.filter(isUpcoming(today));
  const byRegion = ahead.reduce(
    (groups, event) =>
      groups.set(regionOf(event), [...(groups.get(regionOf(event)) ?? []), event]),
    new Map<string, readonly CompactEvent[]>(),
  );
  return [...byRegion]
    .toSorted(([, left], [, right]) => right.length - left.length)
    .slice(0, max)
    .flatMap(([region, list]) =>
      [soonest(list)]
        .filter((event): event is CompactEvent => event !== undefined)
        .map((event) => ({ region, name: regionName(region), count: list.length, event })),
    );
};
