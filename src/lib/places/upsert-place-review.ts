const SQL = `INSERT INTO place_reviews (id, place_id, region, user_id, rating, comment, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)
             ON CONFLICT (user_id, place_id)
               DO UPDATE SET rating = excluded.rating, comment = excluded.comment, updated_at = excluded.updated_at`;

/** Create or update the user's review for a place (one per user per place). */
export const upsertPlaceReview = async (
  db: D1Database,
  input: Readonly<{ placeId: string; region: string; userId: string; rating: number; comment: string | null }>,
): Promise<void> => {
  const now = new Date().toISOString();
  const id = crypto.randomUUID().replace(/-/g, '');
  await db
    .prepare(SQL)
    .bind(id, input.placeId, input.region, input.userId, input.rating, input.comment, now, now)
    .run();
};
