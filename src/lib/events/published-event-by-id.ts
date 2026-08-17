import type { EventRow } from './event-row-types.ts';
import { EVENT_COLUMNS } from './event-columns.ts';
import { isDefined } from '../is-defined.ts';
import { toCompact } from './to-compact.ts';

/** A single published event by id, or nothing — for the SSR detail route. */
export const publishedEventById = async (
  db: D1Database,
  id: string,
): Promise<Record<string, unknown> | undefined> => {
  const row = await db
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ? AND status = 'published'`)
    .bind(id)
    .first<EventRow>();
  return [row ?? undefined].filter(isDefined).map(toCompact).at(0);
};
