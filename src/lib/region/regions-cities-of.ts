import { regionOf } from './region-of.ts';
import { REGION_NAMES } from './regions.ts';
import { cityName } from './city-name.ts';
import type { CompactEvent } from '../events/event-schema.ts';

export type CityEntry = Readonly<{ slug: string; name: string; count: number }>;
export type RegionGroup = Readonly<{ slug: string; name: string; count: number; cities: readonly CityEntry[] }>;

/** Every region (alphabetical) as a group header, each with the cities that have
 *  events under it (alphabetical), and an event count on every row — the data
 *  the combined region+city picker renders. City = the event's `ct` (province
 *  capital) slug; a city belongs to the region its events carry. */
export const regionsAndCitiesOf = (events: readonly CompactEvent[]): readonly RegionGroup[] => {
  const regionCount = new Map<string, number>();
  const cityCount = new Map<string, Map<string, number>>();
  for (const event of events) {
    const rg = regionOf(event);
    regionCount.set(rg, (regionCount.get(rg) ?? 0) + 1);
    const ct = event.ct;
    if (!ct) continue;
    const cities = cityCount.get(rg) ?? new Map<string, number>();
    cities.set(ct, (cities.get(ct) ?? 0) + 1);
    cityCount.set(rg, cities);
  }
  return Object.entries(REGION_NAMES)
    .map(([slug, name]) => {
      const cities = [...(cityCount.get(slug) ?? new Map<string, number>()).entries()]
        .map(([citySlug, count]) => ({ slug: citySlug, name: cityName(citySlug), count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return { slug, name, count: regionCount.get(slug) ?? 0, cities };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};
