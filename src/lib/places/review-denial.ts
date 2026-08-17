import { isPlaceId } from './is-place-id.ts';
import { isRating } from './is-rating.ts';
import { REGION_GEO } from '../region/region-bounds.ts';
import type { ReviewInput } from './review-input.ts';

const invalidPlace = (): Response => Response.json({ error: 'invalid place' }, { status: 400 });
const invalidRegion = (): Response => Response.json({ error: 'invalid region' }, { status: 400 });
const invalidRating = (): Response =>
  Response.json({ error: 'invalid', detail: 'Rating must be 1–5.' }, { status: 400 });

/** Why a review is refused, in the order the guards ran: the place id, then the
 *  region, then the rating. Undefined means the review may be written. */
export const reviewDenial = (input: ReviewInput): Response | undefined =>
  [
    ...[input].filter((review) => !isPlaceId(review.place)).map(invalidPlace),
    ...[input].filter((review) => !(review.region in REGION_GEO)).map(invalidRegion),
    ...[input].filter((review) => !isRating(review.rating)).map(invalidRating),
  ].at(0);
