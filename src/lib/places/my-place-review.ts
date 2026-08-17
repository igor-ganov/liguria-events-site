import type { MyReview } from './place-review-types.ts';

const SQL = 'SELECT rating, comment FROM place_reviews WHERE user_id = ? AND place_id = ?';

/** The signed-in user's own review for a place, if any (any status). */
export const myPlaceReview = async (
  db: D1Database,
  userId: string,
  placeId: string,
): Promise<MyReview | null> => {
  const row = await db.prepare(SQL).bind(userId, placeId).first<MyReview>();
  return row ?? null;
};
