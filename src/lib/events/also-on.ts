import { alsoNear } from './also-near.ts';
import { cachedEvents } from '../../data/cached-events.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * What else is on near this event, read from the corpus the page already has
 * loaded.
 *
 * A source that will not answer costs the block, never the page — the same
 * rule the editions block follows.
 */
export const alsoOn = async (
  here: CompactEvent,
  today: string,
): Promise<readonly CompactEvent[]> =>
  alsoNear(
    (await cachedEvents(EVENTS_URL).catch(() => ({ events: [] }))).events,
    here,
    today,
  );
