import { cityName } from '../region/city-name.ts';
import { regionOf } from '../region/region-of.ts';
import { slugify } from '../slugify.ts';
import type { CompactEvent } from './event-schema.ts';

/** A venue with events, as a page of its own. */
export type VenueEntry = Readonly<{
  region: string;
  city: string;
  slug: string;
  name: string;
  count: number;
}>;

// One event is a real answer to "what's on at X", so it earns a place in the
// sitemap. The old threshold of three was an arbitrary gate that turned real
// venues into 404s; the page itself now exists for any venue under a
// recognised city, and this only decides what gets advertised.
const MIN_EVENTS = 1;

// Phrases the sources use in place of a venue when there is not one. A page for
// "various places in the city" is a page about nothing, and it would compete
// with the city feed that already answers that question properly.
const NOT_A_PLACE: readonly string[] = [
  'luoghi-vari',
  'varie-sedi',
  'sedi-varie',
  'location-varie',
  'vari-luoghi',
  'in-tutta-la-citta',
  'centro-storico',
  'online',
  'da-definire',
];

// The crawler also fills the venue with the city's own name often enough to
// matter — 55 events in one live snapshot said venue "Milano" in city Milano.
const isRealVenue = (name: string, city: string): boolean => {
  const slug = slugify(name);
  return (
    name.trim() !== '' &&
    slug !== slugify(cityName(city)) &&
    slug !== slugify(city) &&
    !NOT_A_PLACE.some((generic) => slug.startsWith(generic))
  );
};

const keyOf = (event: CompactEvent): string =>
  `${regionOf(event)}/${event.ct ?? ''}/${slugify(event.v ?? '')}`;

/** Every venue worth its own page, busiest first. Grouped by slug within a
 *  city, so two spellings of one theatre become one page rather than two. */
export const venuesOf = (events: readonly CompactEvent[]): readonly VenueEntry[] => {
  const located = events.filter(
    (event) => (event.ct ?? '') !== '' && isRealVenue(event.v ?? '', event.ct ?? ''),
  );
  const groups = new Map<string, CompactEvent[]>();
  located.forEach((event) => groups.set(keyOf(event), [...(groups.get(keyOf(event)) ?? []), event]));
  return [...groups.entries()]
    .filter(([, list]) => list.length >= MIN_EVENTS)
    // The key already carries region/city/slug, so the entry is read back out
    // of it rather than reconstructed from a sample event.
    .map(([key, list]) => {
      const [region = '', city = '', slug = ''] = key.split('/');
      return { region, city, slug, name: list[0]?.v ?? '', count: list.length };
    })
    .sort((a, b) => b.count - a.count);
};
