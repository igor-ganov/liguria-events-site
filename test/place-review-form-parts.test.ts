// The client side of the place reviews form: the request each action makes.
// Pure, so the URL, method and body the API sees are locked without a network.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { reviewRequest } from '../src/components/places/review-request.ts';
import type { ReviewInput } from '../src/components/places/review-request.ts';

const input: ReviewInput = {
  place: 'osm:node/42',
  region: 'liguria',
  rating: 4,
  comment: 'Lovely',
};

describe('reviewRequest', () => {
  test('an upsert POSTs the whole review as a JSON body', () => {
    const call = reviewRequest('POST', input);
    assert.equal(call.url, '/api/places/reviews');
    assert.equal(call.init.method, 'POST');
    assert.deepEqual(call.init.headers, { 'content-type': 'application/json' });
    assert.deepEqual(JSON.parse(String(call.init.body)), input);
  });

  test('a removal DELETEs by place, with no body', () => {
    const call = reviewRequest('DELETE', input);
    assert.equal(call.url, '/api/places/reviews?place=osm%3Anode%2F42');
    assert.equal(call.init.method, 'DELETE');
    assert.equal(call.init.body, undefined);
    assert.equal(call.init.headers, undefined);
  });

  test('the place id is percent-encoded, so a slash or colon cannot break the query', () => {
    const call = reviewRequest('DELETE', { ...input, place: 'osm:way/7?x=1&y=2' });
    assert.equal(call.url, '/api/places/reviews?place=osm%3Away%2F7%3Fx%3D1%26y%3D2');
  });

  test('an empty comment still posts, and the rating rides along', () => {
    const call = reviewRequest('POST', { ...input, comment: '', rating: 1 });
    assert.deepEqual(JSON.parse(String(call.init.body)), {
      place: 'osm:node/42',
      region: 'liguria',
      rating: 1,
      comment: '',
    });
  });
});
