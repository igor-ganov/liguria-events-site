import { cityName } from '../region/city-name.ts';
import { slugify } from '../slugify.ts';

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

/** Whether a venue name names a place of its own. The crawler also fills the
 *  venue with the city's own name often enough to matter — 55 events in one
 *  live snapshot said venue "Milano" in city Milano. */
export const isRealVenue = (name: string, city: string): boolean =>
  name.trim() !== '' &&
  slugify(name) !== slugify(cityName(city)) &&
  slugify(name) !== slugify(city) &&
  !NOT_A_PLACE.some((generic) => slugify(name).startsWith(generic));
