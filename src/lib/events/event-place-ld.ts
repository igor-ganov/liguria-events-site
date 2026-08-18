import { cityName } from '../region/city-name.ts';
import type { CompactEvent } from './event-schema.ts';

type Json = Record<string, unknown>;

const drop = (obj: Json): Json =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== ''));

// A street line when the source gave one, the city otherwise. Google requires an
// address on the place: a Place with only a venue name is rejected, and being
// rejected means the event never reaches the search results at all.
const addressOf = (event: CompactEvent, address: string | undefined): Json =>
  drop({
    '@type': 'PostalAddress',
    streetAddress: address,
    addressLocality: cityName(event.ct ?? ''),
    addressCountry: 'IT',
  });

/**
 * Where the event happens, as schema.org expects it. Always present: an event
 * whose venue we never learned still happened in a known city, and naming the
 * city is both true and enough to qualify.
 */
export const eventPlaceLd = (event: CompactEvent, address: string | undefined): Json =>
  drop({
    '@type': 'Place',
    name: event.v ?? cityName(event.ct ?? ''),
    address: addressOf(event, address),
  });
