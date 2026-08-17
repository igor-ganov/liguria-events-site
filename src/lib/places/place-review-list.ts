import type { PlaceReview } from './place-review-types.ts';

const SQL = `SELECT u.handle AS handle, r.rating AS rating, r.comment AS comment, r.created_at AS createdAt
               FROM place_reviews r JOIN users u ON u.id = r.user_id
              WHERE r.place_id = ? AND r.status = 'published'
              ORDER BY r.created_at DESC LIMIT ?`;

/** The most recent published reviews for a place, newest first. */
export const placeReviewList = async (
  db: D1Database,
  placeId: string,
  limit = 30,
): Promise<readonly PlaceReview[]> => {
  const res = await db.prepare(SQL).bind(placeId, limit).all<PlaceReview>();
  return res.results ?? [];
};
