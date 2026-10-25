import { alsoAround } from './also-around.ts';
import { cachedEvents } from '../../data/cached-events.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { AlsoAround } from './also-around.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * What else is on at this event's venue and near it, read from the corpus the
 * page already has loaded.
 *
 * A source that will not answer costs the blocks, never the page — the same
 * rule the editions block follows.
 */
export const alsoOn = async (
  here: CompactEvent,
  today: string,
): Promise<AlsoAround> =>
  alsoAround(
    (await cachedEvents(EVENTS_URL).catch(() => ({ events: [] }))).events,
    here,
    today,
  );
