import { cityName } from '../../region/city-name.ts';
import type { CompactEvent } from '../event-schema.ts';

/** The address under the venue's name, and the town when the address does not
 *  already say it. */
export type PlaceLines = Readonly<{ street: string | undefined; town: string | undefined }>;

const fold = (text: string): string => text.toLocaleLowerCase('it').normalize('NFD').replace(/\p{M}/gu, '');

// The crawler writes the venue first ("Teatro X, piazza Y 5, Camogli"); the
// heading above already says it.
const withoutVenue = (address: string, venue: string): string =>
  [address.slice(venue.length).replace(/^[\s,–-]+/, '')].find(() => venue !== '' && fold(address).startsWith(fold(venue))) ?? address;

/** Where an event is, in the lines the second knot of the page prints. */
export const placeLines = (event: CompactEvent, address: string | undefined): PlaceLines => {
  const street = [withoutVenue(address ?? '', event.v ?? '')].find((line) => line !== '');
  const town = [cityName(event.ct ?? '')].find((name) => name !== '' && !fold(street ?? '').includes(fold(name)));
  return { street, town };
};
