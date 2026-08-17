import { roundedRating } from './rounded-rating.ts';
import type { ReviewSummary } from './place-review-types.ts';

const SQL = `SELECT AVG(rating) AS avg, COUNT(*) AS count
               FROM place_reviews WHERE place_id = ? AND status = 'published'`;

/** Average rating + count of published reviews for a place. */
export const placeReviewSummary = async (db: D1Database, placeId: string): Promise<ReviewSummary> => {
  const row = await db.prepare(SQL).bind(placeId).first<{ avg: number | null; count: number }>();
  return { avg: roundedRating(row?.avg), count: row?.count ?? 0 };
};
