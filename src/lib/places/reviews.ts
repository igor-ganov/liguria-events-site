// User reviews on a place (D1). Places aren't rows in the DB — they live in the
// static shards — so everything keys on the place's open-data id. See the
// 0005_place_reviews migration. This module is guard/query heavy by nature
// (lint-exempt like the rest of src/lib/places).

export type PlaceReview = Readonly<{ handle: string; rating: number; comment: string | null; createdAt: string }>;
export type ReviewSummary = Readonly<{ avg: number; count: number }>;
export type MyReview = Readonly<{ rating: number; comment: string | null }>;

/** Average rating + count of published reviews for a place. */
export const placeReviewSummary = async (db: D1Database, placeId: string): Promise<ReviewSummary> => {
  const row = await db
    .prepare(`SELECT AVG(rating) AS avg, COUNT(*) AS count FROM place_reviews WHERE place_id = ? AND status = 'published'`)
    .bind(placeId)
    .first<{ avg: number | null; count: number }>();
  return { avg: row?.avg ? Math.round((row.avg as number) * 10) / 10 : 0, count: row?.count ?? 0 };
};

/** The most recent published reviews for a place, newest first. */
export const placeReviewList = async (db: D1Database, placeId: string, limit = 30): Promise<readonly PlaceReview[]> => {
  const res = await db
    .prepare(
      `SELECT u.handle AS handle, r.rating AS rating, r.comment AS comment, r.created_at AS createdAt
         FROM place_reviews r JOIN users u ON u.id = r.user_id
        WHERE r.place_id = ? AND r.status = 'published'
        ORDER BY r.created_at DESC LIMIT ?`,
    )
    .bind(placeId, limit)
    .all<PlaceReview>();
  return res.results ?? [];
};

/** The signed-in user's own review for a place, if any (any status). */
export const myPlaceReview = async (db: D1Database, userId: string, placeId: string): Promise<MyReview | null> => {
  const row = await db
    .prepare(`SELECT rating, comment FROM place_reviews WHERE user_id = ? AND place_id = ?`)
    .bind(userId, placeId)
    .first<MyReview>();
  return row ?? null;
};

/** Create or update the user's review for a place (one per user per place). */
export const upsertPlaceReview = async (
  db: D1Database,
  input: Readonly<{ placeId: string; region: string; userId: string; rating: number; comment: string | null }>,
): Promise<void> => {
  const now = new Date().toISOString();
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(
      `INSERT INTO place_reviews (id, place_id, region, user_id, rating, comment, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)
       ON CONFLICT (user_id, place_id)
         DO UPDATE SET rating = excluded.rating, comment = excluded.comment, updated_at = excluded.updated_at`,
    )
    .bind(id, input.placeId, input.region, input.userId, input.rating, input.comment, now, now)
    .run();
};

/** Remove the user's own review for a place. */
export const deletePlaceReview = async (db: D1Database, userId: string, placeId: string): Promise<void> => {
  await db.prepare('DELETE FROM place_reviews WHERE user_id = ? AND place_id = ?').bind(userId, placeId).run();
};
