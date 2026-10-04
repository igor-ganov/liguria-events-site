import type { ReviewSummary } from '../places/place-review-types.ts';

/** Fewer ratings than this is somebody's opinion, not a rating of the event. */
const ENOUGH = 3;

type RatingLd = Readonly<Record<string, string | number>>;

/** schema.org AggregateRating for an event, once enough people have rated it. */
export const eventRatingLd = (rating: ReviewSummary | undefined): RatingLd | undefined =>
  [rating]
    .filter((summary): summary is ReviewSummary => summary !== undefined && summary.count >= ENOUGH)
    .map((summary) => ({
      '@type': 'AggregateRating',
      ratingValue: summary.avg,
      ratingCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    }))
    .at(0);
