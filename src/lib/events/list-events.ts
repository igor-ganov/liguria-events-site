export type EventRow = {
  id: string;
  origin: string;
  status: string;
  title_en: string | null;
  start_date: string;
  end_date: string | null;
  venue: string | null;
  created_at: string;
};

const COLS = 'id, origin, status, title_en, start_date, end_date, venue, created_at';

/** Events in any of the given statuses, newest first (admin/moderation view). */
export const listEventsByStatus = async (
  db: D1Database,
  statuses: readonly string[],
): Promise<readonly EventRow[]> => {
  const placeholders = statuses.map(() => '?').join(',');
  const result = await db
    .prepare(`SELECT ${COLS} FROM events WHERE status IN (${placeholders}) ORDER BY created_at DESC LIMIT 200`)
    .bind(...statuses)
    .all<EventRow>();
  return result.results ?? [];
};
