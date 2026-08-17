import { branch } from '../lib/branch.ts';
import { cachedEvents } from '../data/cached-events.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import type { EventsPayload } from '../lib/events/decode-events.ts';

/** The shared corpus, but only for the pages that embed it. Feed, calendar and
 *  map need the full event list; every other page skips this ~44 KB
 *  (compressed) island and the build-time fetch entirely. */
export const pageEvents = (needsEvents: boolean): Promise<EventsPayload | undefined> =>
  branch(needsEvents)<Promise<EventsPayload | undefined>>(
    () => cachedEvents(EVENTS_URL),
    () => Promise.resolve(undefined),
  );
