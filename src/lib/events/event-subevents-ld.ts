import { eventDateTime } from '../seo/event-datetime.ts';
import { isContainer } from './is-container.ts';
import type { CompactEvent } from './event-schema.ts';

type Json = Record<string, unknown>;

/**
 * A container's evenings as sub-events.
 *
 * This is the whole reason to tell containers apart in structured data too: a
 * festival announced as "1–31 August" reads to a search engine as one month-long
 * thing, and it will happily offer it to someone searching for the 13th. Listed
 * as sub-events, each night is its own answer to "what is on tonight".
 */
export const eventSubEventsLd = (event: CompactEvent, name: string, place: Json): readonly Json[] =>
  [event]
    .filter(isContainer)
    .flatMap((container) => [...(container.p ?? [])])
    .map((session) => ({
      '@type': 'Event',
      name: session.title ?? name,
      startDate: eventDateTime(session.date, session.time ?? event.h),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: place,
    }));
