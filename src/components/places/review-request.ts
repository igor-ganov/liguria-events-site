// The wire format of the two review calls: an upsert POSTs the whole review in
// a JSON body, a removal DELETEs by place. Pure, so the exact URL, method and
// body the API sees are unit-tested without a network.
export type ReviewMethod = 'POST' | 'DELETE';
export type ReviewInput = Readonly<{
  place: string;
  region: string;
  rating: number;
  comment: string;
}>;
export type ReviewCall = Readonly<{ url: string; init: RequestInit }>;

const REVIEWS_URL = '/api/places/reviews';

/** The request to make for a review upsert or removal. */
export const reviewRequest = (method: ReviewMethod, input: ReviewInput): ReviewCall => {
  switch (method) {
    case 'POST':
      return {
        url: REVIEWS_URL,
        init: {
          method,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        },
      };
    case 'DELETE':
      return {
        url: `${REVIEWS_URL}?place=${encodeURIComponent(input.place)}`,
        init: { method },
      };
  }
};
