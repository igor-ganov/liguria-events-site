import { isPlaceId } from './is-place-id.ts';

// An event is reviewed under its own twelve-hex id behind a prefix, so an
// event and a place can never collide in the one table both are kept in.
const EVENT_SUBJECT = /^evt:[0-9a-f]{12}$/;

/**
 * Whether a value names something a review can be about: a place, by its
 * open-data id, or an event. Reviews of both live in one table keyed by this
 * string (the column is still called place_id — it was there first), so the
 * shape is held tight: the endpoint must not be a way to write arbitrary keys.
 */
export const isReviewSubject = (value: unknown): value is string =>
  isPlaceId(value) || (typeof value === 'string' && EVENT_SUBJECT.test(value));
