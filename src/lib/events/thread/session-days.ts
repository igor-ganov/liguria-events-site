import type { CompactEvent } from '../event-schema.ts';

/** The days of an event's programme, once each, in the order they come: two
 *  starts on one evening are one day to go. */
export const sessionDays = (event: CompactEvent): readonly string[] =>
  [...new Set((event.p ?? []).map((session) => session.date))].sort();
