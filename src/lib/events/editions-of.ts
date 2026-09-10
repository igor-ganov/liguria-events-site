import { archivedEvents } from '../../data/archived-events.ts';
import { cachedEvents } from '../../data/cached-events.ts';
import { decodeEventList } from './decode-event-list.ts';
import { EVENTS_URL } from '../../data/events-url.ts';
import { otherEditions } from './other-editions.ts';
import { publishedEvents } from './d1-published.ts';
import type { ArchivedEvent } from './archived-schema.ts';

/**
 * The other years of this event, gathered from everywhere an edition can live.
 *
 * Three sources, because it can be in any of them: the corpus holds what is
 * coming, the archive what is over, and D1 the events people entered
 * themselves — a yearly feast run by its own organiser is in neither of the
 * other two. A source that will not answer costs the block, never the page.
 */
export const editionsOf = async (
  event: ArchivedEvent,
  db: D1Database,
): Promise<readonly ArchivedEvent[]> => {
  const submitted = await publishedEvents(db).catch(() => []);
  const corpus = await cachedEvents(EVENTS_URL).catch(() => ({ events: [] }));
  return otherEditions(event, [
    ...corpus.events,
    ...(await archivedEvents(EVENTS_URL)),
    ...decodeEventList(submitted),
  ]);
};
