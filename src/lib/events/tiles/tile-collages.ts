import { cachedEvents } from '../../../data/cached-events.ts';
import { collagePool } from './collage-pool.ts';
import { dealCollage } from './deal-collage.ts';
import { EVENTS_URL } from '../../../data/events-url.ts';
import type { CompactEvent } from '../event-schema.ts';

/** The pictures each tile of an event page wears, by tile. */
export type TileCollages = Readonly<{ when: readonly string[]; where: readonly string[]; price: readonly string[]; month: readonly string[] }>;

// How many pictures each tile's collage holds, in the order they are dealt.
const HANDS = [6, 4, 3, 2] as const;

/**
 * Other events' photographs for the tiles of this event's page, from the
 * corpus the page already reads. A source that will not answer costs the
 * collages — the tiles go plain — never the page.
 */
export const tileCollages = async (here: CompactEvent): Promise<TileCollages> => {
  const all = (await cachedEvents(EVENTS_URL).catch(() => ({ events: [] }))).events;
  const [when = [], where = [], price = [], month = []] = dealCollage(collagePool(all, here, 15), HANDS);
  return { when, where, price, month };
};
