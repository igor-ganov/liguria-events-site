import type { AdoptionRow } from './adoption-row.ts';

// 'crawler' stays its origin: it is still the crawler that found it, and the
// listings of what people submitted must not start offering it a second time.
// A second approved claim only changes whose it is; the first organiser's
// edits are not thrown away by the hand-over.
const SQL = `INSERT INTO events
       (id, origin, submitter_id, status, visibility, title_en, title_it, title_ru, desc_en, desc_it, desc_ru,
        start_date, end_date, categories, venue, address, cover_image, lat, lng, free, sessions, kind,
        gem, created_at, updated_at)
     VALUES (?, 'crawler', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
     ON CONFLICT (id) DO UPDATE SET submitter_id = excluded.submitter_id, updated_at = excluded.updated_at`;

const orEmpty = <Value,>(value: Value | undefined): Value | null => value ?? null;

/** The statement that stores a crawled event under its organiser. */
export const adoptEvent = (db: D1Database, row: AdoptionRow): D1PreparedStatement =>
  db
    .prepare(SQL)
    .bind(
      row.id, row.submitterId, row.status, row.visibility,
      row.titleEn, row.titleIt, row.titleRu, row.descEn, row.descIt, row.descRu,
      row.startDate, orEmpty(row.endDate), row.categories, orEmpty(row.venue), orEmpty(row.address),
      orEmpty(row.cover), orEmpty(row.lat), orEmpty(row.lng), row.free, orEmpty(row.sessions), orEmpty(row.kind),
      row.now, row.now,
    );
