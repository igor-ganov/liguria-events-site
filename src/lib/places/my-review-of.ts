import { myPlaceReview } from './reviews.ts';
import type { MyReview } from './reviews.ts';

/** The caller's own review of a place, or nothing at all when signed out. */
export const myReviewOf = async (
  db: D1Database,
  placeId: string,
  userId?: string,
): Promise<MyReview | undefined> => {
  const found = await Promise.all(
    [userId].filter((id) => id !== undefined).map((id) => myPlaceReview(db, id, placeId)),
  );
  return found[0] ?? undefined;
};
