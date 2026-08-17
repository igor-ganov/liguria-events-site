import { isPlaceId } from './is-place-id.ts';
import { reviewDenial } from './review-denial.ts';
import { reviewInput } from './review-input.ts';
import { upsertPlaceReview } from './reviews.ts';
import type { AppUser } from '../auth/types.ts';
import type { ReviewInput } from './review-input.ts';

/** The place id already passed `reviewDenial`; this guard only narrows the
 *  unknown to a string, and answers the very same refusal if it somehow could
 *  not — nothing is written in that case. */
const store = async (db: D1Database, user: AppUser, input: ReviewInput): Promise<Response> => {
  const stored = await Promise.all(
    [input.place].filter(isPlaceId).map(async (placeId) => {
      await upsertPlaceReview(db, {
        placeId,
        region: input.region,
        userId: user.id,
        rating: input.rating,
        comment: input.comment,
      });
      return Response.json({ ok: true });
    }),
  );
  return stored.at(0) ?? Response.json({ error: 'invalid place' }, { status: 400 });
};

/** Create or update the caller's review (rating 1..5 + optional text). */
export const savePlaceReview = async (db: D1Database, user: AppUser, body: unknown): Promise<Response> => {
  const input = reviewInput(body);
  return reviewDenial(input) ?? (await store(db, user, input));
};
