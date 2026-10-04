// Ratings and comments on events ride on the review system places already
// have: the same table, the same endpoint, the same form. What is new is the
// thing being reviewed, and the endpoint must accept exactly that new shape
// and nothing looser, because the id ends up as a key somebody else chose.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventJsonLd } from '../src/lib/events/event-jsonld.ts';
import { eventTiles } from '../src/lib/events/event-tiles.ts';
import { isReviewSubject } from '../src/lib/places/is-review-subject.ts';
import { reviewDenial } from '../src/lib/places/review-denial.ts';
import { reviewSubjectOf } from '../src/lib/events/review-subject-of.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event: CompactEvent = { id: '0123456789ab', t: 'Concerto', s: '2026-10-08', c: ['music'], u: 'https://example.test/e' };

describe('what can be reviewed', () => {
  test('an event, named by its id', () => {
    assert.equal(reviewSubjectOf(event), 'evt:0123456789ab');
    assert.equal(isReviewSubject('evt:0123456789ab'), true);
  });

  test('a place, as before', () => {
    assert.equal(isReviewSubject('osm:node/123'), true);
    assert.equal(isReviewSubject('ovt:abc123'), true);
  });

  test('nothing that only resembles either', () => {
    ['evt:', 'evt:xyz', 'evt:0123456789abc', 'evt:0123456789AB', 'event:0123456789ab', '', 'osm:node/x'].forEach((value) =>
      assert.equal(isReviewSubject(value), false, value),
    );
    assert.equal(isReviewSubject(undefined), false);
    assert.equal(isReviewSubject(12), false);
  });
});

describe('a review of an event', () => {
  const review = { place: 'evt:0123456789ab', region: 'liguria', rating: 4, comment: null };

  test('is accepted', () => {
    assert.equal(reviewDenial(review), undefined);
  });

  test('is refused for a malformed subject, a region that does not exist, a rating out of range', async () => {
    assert.equal(reviewDenial({ ...review, place: 'evt:nope' })?.status, 400);
    assert.equal(reviewDenial({ ...review, region: 'atlantis' })?.status, 400);
    assert.equal(reviewDenial({ ...review, rating: 6 })?.status, 400);
  });
});

const labels = { starts: 'starts', dates: 'dates', duration: 'lasts', price: 'from', reviews: 'Reviews' };

describe('the rating tile', () => {
  test('shows the average over the word for what it is', () => {
    const tile = eventTiles({ event, lang: 'en', labels, rating: { avg: 4.6, count: 12 } }).find((item) => item.key === 'rating');
    assert.deepEqual(tile, { key: 'rating', icon: 'star', value: '4.6', label: 'Reviews · 12' });
  });

  test('does not exist until somebody has rated', () => {
    assert.equal(eventTiles({ event, lang: 'en', labels, rating: { avg: 0, count: 0 } }).some((item) => item.key === 'rating'), false);
    assert.equal(eventTiles({ event, lang: 'en', labels }).some((item) => item.key === 'rating'), false);
  });
});

describe('the rating in structured data', () => {
  const ld = (rating?: { avg: number; count: number }): Record<string, unknown> =>
    JSON.parse(eventJsonLd({ event, title: 'Concerto', desc: 'A concert.', image: undefined, address: 'Genova', url: 'https://dovego.it/event/x/', rating }));

  test('is stated once three people have rated', () => {
    assert.deepEqual(ld({ avg: 4.3, count: 3 })['aggregateRating'], {
      '@type': 'AggregateRating',
      ratingValue: 4.3,
      ratingCount: 3,
      bestRating: 5,
      worstRating: 1,
    });
  });

  test('is left out below that: one enthusiast is not a rating', () => {
    assert.equal(ld({ avg: 5, count: 2 })['aggregateRating'], undefined);
    assert.equal(ld()['aggregateRating'], undefined);
  });
});
