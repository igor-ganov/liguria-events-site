import type { EventRow } from './event-row-types.ts';
import { EVENT_COLUMNS } from './event-columns.ts';
import { toCompact } from './to-compact.ts';

/** Published events (feed corpus supplement), newest start first, capped. */
export const publishedEvents = async (db: D1Database): Promise<Record<string, unknown>[]> => {
  const rows = await db
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE status = 'published' ORDER BY start_date LIMIT 500`)
    .all<EventRow>();
  return (rows.results ?? []).map(toCompact);
};
