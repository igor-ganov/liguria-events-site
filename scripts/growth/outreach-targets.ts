import { cityName } from '../../src/lib/region/city-name.ts';
import { venuesOf } from '../../src/lib/events/venues-of.ts';
import type { CompactEvent } from '../../src/lib/events/event-schema.ts';

const SITE = 'https://dovego.it/it';

export type Target = Readonly<{
  kind: 'venue' | 'comune';
  name: string;
  city: string;
  region: string;
  /** The page that already exists for them, and the reason to write at all. */
  page: string;
  events: number;
  /** Where to look for the address. Deliberately a search, not a guess. */
  findContact: string;
}>;

/** Enough of a programme that the page is worth their while linking to. Below
 *  this we are asking for a favour rather than offering one. */
const MIN_VENUE_EVENTS = 3;
const MIN_CITY_EVENTS = 8;

const venueTargets = (events: readonly CompactEvent[], limit: number): readonly Target[] =>
  venuesOf(events)
    .filter((venue) => venue.count >= MIN_VENUE_EVENTS)
    .slice(0, limit)
    .map((venue) => ({
      kind: 'venue',
      name: venue.name,
      city: cityName(venue.city),
      region: venue.region,
      page: `${SITE}/${venue.region}/${venue.city}/${venue.slug}/`,
      events: venue.count,
      findContact: `https://duckduckgo.com/?q=${encodeURIComponent(`${venue.name} ${cityName(venue.city)} contatti email`)}`,
    }));

/** A comune's own "eventi" page is the closest thing in Italy to a local
 *  directory, and its URP address is public by law. */
const comuneTargets = (events: readonly CompactEvent[], limit: number): readonly Target[] => {
  const counts = new Map<string, { region: string; n: number }>();
  events.forEach((event) => {
    const city = event.ct ?? '';
    const prev = counts.get(city);
    counts.set(city, { region: event.rg ?? prev?.region ?? '', n: (prev?.n ?? 0) + 1 });
  });
  counts.delete('');
  return [...counts.entries()]
    .filter(([, { n }]) => n >= MIN_CITY_EVENTS)
    .toSorted((a, b) => b[1].n - a[1].n)
    .slice(0, limit)
    .map(([city, { region, n }]) => ({
      kind: 'comune',
      name: `Comune di ${cityName(city)}`,
      city: cityName(city),
      region,
      page: `${SITE}/${region}/${city}/`,
      events: n,
      findContact: `https://duckduckgo.com/?q=${encodeURIComponent(`comune di ${cityName(city)} URP contatti`)}`,
    }));
};

/**
 * Who is worth writing to, ranked by what we already hold for them.
 *
 * Deliberately short. Backlink outreach at volume is a link scheme, which
 * Google penalises and which would get this domain reported as spam long
 * before it moved a ranking. The value is in the few where the link is
 * genuinely useful to THEM: a venue whose whole programme we list, a comune
 * whose events page has nothing like ours next to it.
 */
export const outreachTargets = (
  events: readonly CompactEvent[],
  limits: Readonly<{ venues: number; comuni: number }> = { venues: 20, comuni: 10 },
): readonly Target[] => [
  ...venueTargets(events, limits.venues),
  ...comuneTargets(events, limits.comuni),
];
