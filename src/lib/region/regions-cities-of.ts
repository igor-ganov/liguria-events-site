import { regionOf } from './region-of.ts';
import { REGION_NAMES } from './regions.ts';
import { cityName } from './city-name.ts';
import { countBy } from '../count-by.ts';
import type { CompactEvent } from '../events/event-schema.ts';

export type CityEntry = Readonly<{ slug: string; name: string; count: number }>;
export type RegionGroup = Readonly<{ slug: string; name: string; count: number; cities: readonly CityEntry[] }>;

// City tallies are keyed `region|city` — one flat Map instead of a Map of Maps,
// so the counting stays a single `countBy` over a mapped array. The separator
// must be a character no slug can contain (they are [a-z0-9-]), otherwise a
// region whose slug prefixes another's would collect the other's cities.
const SEP = '|';

const cityKeysOf = (events: readonly CompactEvent[]): readonly string[] =>
  events
    .map((event) => ({ region: regionOf(event), city: event.ct ?? '' }))
    .filter((pair) => pair.city !== '')
    .map((pair) => `${pair.region}${SEP}${pair.city}`);

const citiesUnder = (counts: ReadonlyMap<string, number>, region: string): readonly CityEntry[] =>
  [...counts.entries()]
    .filter(([key]) => key.startsWith(`${region}${SEP}`))
    .map(([key, count]) => ({ slug: key.slice(region.length + SEP.length), count }))
    .map(({ slug, count }) => ({ slug, name: cityName(slug), count }))
    .sort((a, b) => a.name.localeCompare(b.name));

/** Every region (alphabetical) as a group header, each with the cities that have
 *  events under it (alphabetical), and an event count on every row — the data
 *  the combined region+city picker renders. City = the event's `ct` (province
 *  capital) slug; a city belongs to the region its events carry. */
export const regionsAndCitiesOf = (events: readonly CompactEvent[]): readonly RegionGroup[] => {
  const regionCounts = countBy(events.map((event) => regionOf(event)));
  const cityCounts = countBy(cityKeysOf(events));
  return Object.entries(REGION_NAMES)
    .map(([slug, name]) => ({
      slug,
      name,
      count: regionCounts.get(slug) ?? 0,
      cities: citiesUnder(cityCounts, slug),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
