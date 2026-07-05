import { Effect } from 'effect';
import { loadEvents } from './load-events.ts';
import { decodeEventsPayload } from '../lib/events/decode-events.ts';
import type { EventsPayload } from '../lib/events/decode-events.ts';
import fallbackPayload from './events-fallback.json';

/** Build-time singleton (imperative shell): the event-detail pages call the
 *  layout ~160 times per build — fetch the corpus once, share the promise.
 *  Falls back to a committed snapshot when the worker is unreachable (e.g.
 *  Cloudflare free-tier daily-limit 429) so a code-only deploy isn't blocked;
 *  fresh worker data returns on the next successful build. */
let cache: Promise<EventsPayload> | undefined;

export const cachedEvents = (url: string): Promise<EventsPayload> => {
  cache =
    cache ??
    Effect.runPromise(
      loadEvents(url).pipe(
        Effect.orElse(() =>
          decodeEventsPayload(fallbackPayload).pipe(
            Effect.mapError((issue) => new Error(`events fallback rejected: ${String(issue)}`)),
          ),
        ),
      ),
    );
  return cache;
};
