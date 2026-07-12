import { Effect } from 'effect';
import { loadEvents } from './load-events.ts';
import { decodeEventsPayload } from '../lib/events/decode-events.ts';
import type { EventsPayload } from '../lib/events/decode-events.ts';
import { branch } from '../lib/branch.ts';
import fallbackPayload from './events-fallback.json';

/** Shared corpus (imperative shell): the event-detail pages call the layout
 *  ~160 times per build, and every SSR request needs it — fetch once, share the
 *  promise. Falls back to a committed snapshot when the worker is unreachable
 *  so a code-only deploy isn't blocked.
 *
 *  The promise expires: an isolate can live for hours, and without a TTL it
 *  keeps serving whatever corpus it happened to fetch first, so a crawl fix
 *  does not reach the pages until the isolate recycles. The crawl runs every
 *  6h; five minutes of staleness is invisible and costs one subrequest. */
const TTL_MS = 5 * 60 * 1000;

const load = (url: string): Promise<EventsPayload> =>
  Effect.runPromise(
    loadEvents(url).pipe(
      Effect.orElse(() =>
        decodeEventsPayload(fallbackPayload).pipe(
          Effect.mapError((issue) => new Error(`events fallback rejected: ${String(issue)}`)),
        ),
      ),
    ),
  );

let cache: Promise<EventsPayload> | undefined;
let fetchedAt = 0;

const refresh = (url: string, now: number): Promise<EventsPayload> => {
  cache = load(url);
  fetchedAt = now;
  return cache;
};

export const cachedEvents = (url: string): Promise<EventsPayload> => {
  const now = Date.now();
  const cached = cache;
  const fresh = cached !== undefined && now - fetchedAt <= TTL_MS;
  return branch(fresh)(
    () => cached ?? refresh(url, now),
    () => refresh(url, now),
  );
};
