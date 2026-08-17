import { jsonValue } from '../json-value.ts';
import { trimmedString } from '../trimmed-string.ts';

/** A review as it arrives on the wire, before it is judged. `place` stays
 *  unknown until `isPlaceId` has looked at it. */
export type ReviewInput = Readonly<{
  place: unknown;
  region: string;
  rating: number;
  comment: string | null;
}>;

/** Read the POST body. The rating keeps its original reading — `Number` of
 *  whatever was sent, rounded — so a numeric and a numeric-string rating are
 *  still the same request, and anything else stays NaN and is refused. */
export const reviewInput = (body: unknown): ReviewInput => ({
  place: jsonValue(body, 'place'),
  region: trimmedString(jsonValue(body, 'region'), 40),
  rating: Math.round(Number(jsonValue(body, 'rating'))),
  comment: trimmedString(jsonValue(body, 'comment'), 2000) || null,
});
