import type { EventRow } from './list-events.ts';

type SubmittedRow = EventRow & { submitter_id: string };

const COLS = 'id, origin, status, title_en, start_date, end_date, venue, created_at';

/** Everything people (not the crawler) have submitted, keyed by author. */
export const eventsBySubmitter = async (
  db: D1Database,
): Promise<ReadonlyMap<string, readonly EventRow[]>> => {
  const result = await db
    .prepare(
      `SELECT ${COLS}, submitter_id FROM events
        WHERE submitter_id IS NOT NULL ORDER BY created_at DESC LIMIT 500`,
    )
    .all<SubmittedRow>();
  return (result.results ?? []).reduce(
    (groups, row) => groups.set(row.submitter_id, [...(groups.get(row.submitter_id) ?? []), row]),
    new Map<string, readonly EventRow[]>(),
  );
};
