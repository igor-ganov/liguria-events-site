import { deletePlaceReview } from './reviews.ts';
import { isPlaceId } from './is-place-id.ts';

/** Remove the caller's own review for a place; a malformed id is refused and
 *  nothing is deleted. */
export const removePlaceReview = async (
  db: D1Database,
  userId: string,
  place: string,
): Promise<Response> => {
  const removed = await Promise.all(
    [place].filter(isPlaceId).map(async (placeId) => {
      await deletePlaceReview(db, userId, placeId);
      return Response.json({ ok: true });
    }),
  );
  return removed.at(0) ?? Response.json({ error: 'invalid place' }, { status: 400 });
};
