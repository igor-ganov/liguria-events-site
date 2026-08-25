import type { EventRow } from './event-row-types.ts';
import { EVENT_COLUMNS } from './event-columns.ts';
import { toCompact } from './to-compact.ts';

/** Published events (feed corpus supplement), newest start first, capped.
 *
 *  The `visibility` clause is the whole gate between a private invitation and
 *  a public listing: this is the only path a user's event takes into the feed,
 *  and the sitemap and RSS builders read the same helper. */
export const publishedEvents = async (db: D1Database): Promise<Record<string, unknown>[]> => {
  const rows = await db
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE status = 'published' AND visibility = 'public' ORDER BY start_date LIMIT 500`)
    .all<EventRow>();
  return (rows.results ?? []).map(toCompact);
};
