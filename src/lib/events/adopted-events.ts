import { decodeEventList } from './decode-event-list.ts';
import { EVENT_COLUMNS } from './event-columns.ts';
import { toCompact } from './to-compact.ts';
import type { CompactEvent } from './event-schema.ts';
import type { EventRow } from './event-row-types.ts';

const SQL = `SELECT ${EVENT_COLUMNS} FROM events WHERE status = 'published' AND visibility = 'public' AND origin = 'crawler' LIMIT 500`;

/** The crawled events that now have an organiser, as their organisers keep
 *  them. The same visibility gate as every other public read. */
export const adoptedEvents = async (db: D1Database): Promise<readonly CompactEvent[]> =>
  decodeEventList(((await db.prepare(SQL).all<EventRow>()).results ?? []).map(toCompact));
