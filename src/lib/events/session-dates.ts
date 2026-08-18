import type { CompactEvent } from './event-schema.ts';

/** The dates a container actually runs on, ascending. Empty for an event with
 *  no programme — callers fall back to the span rather than to nothing. */
export const sessionDates = (event: CompactEvent): readonly string[] =>
  [...(event.p ?? [])].map((session) => session.date).sort();
