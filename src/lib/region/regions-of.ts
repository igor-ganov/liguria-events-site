import { regionOf } from './region-of.ts';
import { REGION_NAMES } from './regions.ts';
import type { CompactEvent } from '../events/event-schema.ts';

export type RegionEntry = Readonly<{ slug: string; name: string; count: number }>;

/** Every region, always — an empty one still gets a page, so the map of Italy
 *  the site presents has no holes in it. Busiest first, then alphabetical. */
export const regionsOf = (events: readonly CompactEvent[]): readonly RegionEntry[] => {
  const counts = events.reduce(
    (tally, event) => tally.set(regionOf(event), (tally.get(regionOf(event)) ?? 0) + 1),
    new Map<string, number>(),
  );
  return Object.entries(REGION_NAMES)
    .map(([slug, name]) => ({ slug, name, count: counts.get(slug) ?? 0 }))
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};
