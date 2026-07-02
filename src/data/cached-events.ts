import { Effect } from 'effect';
import { loadEvents } from './load-events.ts';
import type { EventsPayload } from '../lib/events/decode-events.ts';

/** Build-time singleton (imperative shell): the event-detail pages call the
 *  layout ~160 times per build — fetch the corpus once, share the promise. */
let cache: Promise<EventsPayload> | undefined;

export const cachedEvents = (url: string): Promise<EventsPayload> => {
  cache = cache ?? Effect.runPromise(loadEvents(url));
  return cache;
};
