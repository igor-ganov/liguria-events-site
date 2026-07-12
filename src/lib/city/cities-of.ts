import { cityOf } from './city-of.ts';
import { cityName } from './city-name.ts';
import type { CompactEvent } from '../events/event-schema.ts';

export type City = Readonly<{ slug: string; name: string; count: number }>;

/** Cities that actually have events, busiest first — the pages that exist. */
export const citiesOf = (events: readonly CompactEvent[]): readonly City[] => {
  const counts = events.reduce(
    (tally, event) => tally.set(cityOf(event), (tally.get(cityOf(event)) ?? 0) + 1),
    new Map<string, number>(),
  );
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, name: cityName(slug), count }))
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};
