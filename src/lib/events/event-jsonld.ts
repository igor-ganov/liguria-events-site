import { eventDateTime } from '../seo/event-datetime.ts';
import { eventStartLd } from './event-start-ld.ts';
import { eventOffersLd } from './event-offers-ld.ts';
import { eventPlaceLd } from './event-place-ld.ts';
import { eventSubEventsLd } from './event-subevents-ld.ts';
import type { CompactEvent } from './event-schema.ts';

type Params = Readonly<{
  event: CompactEvent;
  title: string;
  desc: string;
  image: string | undefined;
  address: string | undefined;
  url: string;
}>;

type Json = Record<string, unknown>;

/** Drop undefined / empty members so optional fields are simply absent. */
const clean = (obj: Json): Json =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0),
    ),
  );

/** schema.org Event JSON-LD; `<` is escaped so the string is safe in a
 *  `<script type="application/ld+json">` body. */
export const eventJsonLd = (params: Params): string => {
  const { event, title, desc, image, address, url } = params;
  const place = eventPlaceLd(event, address);
  return JSON.stringify(
    clean({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: title,
      url,
      startDate: eventStartLd(event),
      endDate: eventDateTime(event.e ?? event.s, undefined),
      // Both are required for the search-results treatment, and both are simply
      // true of everything we list: a real place, on the day it says.
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      image,
      description: desc,
      location: place,
      offers: eventOffersLd(event, url),
      subEvent: eventSubEventsLd(event, title, place),
    }),
  ).replace(/</g, '\\u003c');
};
