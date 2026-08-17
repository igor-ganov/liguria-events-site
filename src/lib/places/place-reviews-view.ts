import { isDefined } from '../is-defined.ts';
import { myPlaceReview, placeReviewList, placeReviewSummary } from './reviews.ts';
import type { AppUser } from '../auth/types.ts';
import type { MyReview } from './reviews.ts';

/** The caller's own review, or null when signed out — this endpoint has always
 *  answered `mine: null` rather than leaving the key out. */
const mineOf = async (db: D1Database, placeId: string, user?: AppUser): Promise<MyReview | null> => {
  const found = await Promise.all([user].filter(isDefined).map((u) => myPlaceReview(db, u.id, placeId)));
  return found.at(0) ?? null;
};

/** Summary + recent reviews for a place, plus the caller's own review. */
export const placeReviewsView = async (
  db: D1Database,
  placeId: string,
  user?: AppUser,
): Promise<Response> => {
  const [summary, reviews, mine] = await Promise.all([
    placeReviewSummary(db, placeId),
    placeReviewList(db, placeId),
    mineOf(db, placeId, user),
  ]);
  return Response.json({ summary, reviews, mine });
};
