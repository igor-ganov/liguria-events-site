// Pure helpers pulled out of src/pages/api/places/reviews.ts.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isActiveMember } from '../src/lib/auth/is-active-member.ts';
import { isPlaceId } from '../src/lib/places/is-place-id.ts';
import { isRating } from '../src/lib/places/is-rating.ts';
import { memberDenial } from '../src/lib/auth/member-denial.ts';
import { reviewDenial } from '../src/lib/places/review-denial.ts';
import { reviewInput } from '../src/lib/places/review-input.ts';
import type { AppUser } from '../src/lib/auth/types.ts';

const member: AppUser = {
  id: 'u1',
  email: 'someone@example.test',
  handle: 'someone',
  role: 'member',
  banned: false,
};
const valid = { place: 'osm:node/42', region: 'liguria', rating: 4, comment: 'Lovely' };
const body = async (res: Response | undefined): Promise<unknown> => await (res ?? new Response('{}')).json();

describe('isPlaceId', () => {
  test('accepts the open-data shapes', () => {
    assert.equal(isPlaceId('osm:node/42'), true);
    assert.equal(isPlaceId('osm:way/7'), true);
    assert.equal(isPlaceId('osm:relation/1234'), true);
    assert.equal(isPlaceId('ovt:8a1f2b'), true);
  });
  test('refuses anything else, so no arbitrary key can be written', () => {
    assert.equal(isPlaceId(''), false);
    assert.equal(isPlaceId('osm:node/'), false);
    assert.equal(isPlaceId('osm:node/42 '), false);
    assert.equal(isPlaceId('osm:point/42'), false);
    assert.equal(isPlaceId('ovt:UPPER'), false);
    assert.equal(isPlaceId(42), false);
    assert.equal(isPlaceId(undefined), false);
  });
});

describe('isRating', () => {
  test('one to five whole stars', () => {
    assert.equal(isRating(1), true);
    assert.equal(isRating(5), true);
  });
  test('nothing outside, and nothing that is not a number', () => {
    assert.equal(isRating(0), false);
    assert.equal(isRating(6), false);
    assert.equal(isRating(3.5), false);
    assert.equal(isRating(Number.NaN), false);
  });
});

describe('reviewInput', () => {
  test('reads the body, trimming and capping the text', () => {
    assert.deepEqual(reviewInput({ place: 'osm:node/42', region: ' liguria ', rating: '4', comment: ' Hi ' }), {
      place: 'osm:node/42',
      region: 'liguria',
      rating: 4,
      comment: 'Hi',
    });
  });
  test('a numeric rating and a rounded one both read as stars', () => {
    assert.equal(reviewInput({ rating: 4 }).rating, 4);
    assert.equal(reviewInput({ rating: 4.4 }).rating, 4);
    assert.equal(Number.isNaN(reviewInput({ rating: 'four' }).rating), true);
    assert.equal(Number.isNaN(reviewInput({}).rating), true);
  });
  test('an empty comment is stored as nothing at all', () => {
    assert.equal(reviewInput({ comment: '   ' }).comment, null);
    assert.equal(reviewInput({}).comment, null);
  });
  test('a long comment is capped at 2000 characters', () => {
    assert.equal(reviewInput({ comment: 'x'.repeat(3000) }).comment?.length, 2000);
  });
});

describe('reviewDenial', () => {
  test('a well-formed review passes', () => {
    assert.equal(reviewDenial(valid), undefined);
  });
  test('a malformed place id is refused first', async () => {
    const denial = reviewDenial({ ...valid, place: 'nonsense', region: 'nowhere', rating: 9 });
    assert.equal(denial?.status, 400);
    assert.deepEqual(await body(denial), { error: 'invalid place' });
  });
  test('an unknown region is refused', async () => {
    const denial = reviewDenial({ ...valid, region: 'nowhere' });
    assert.equal(denial?.status, 400);
    assert.deepEqual(await body(denial), { error: 'invalid region' });
  });
  test('a rating outside 1..5 is refused', async () => {
    const denial = reviewDenial({ ...valid, rating: 9 });
    assert.equal(denial?.status, 400);
    assert.deepEqual(await body(denial), { error: 'invalid', detail: 'Rating must be 1–5.' });
    assert.equal(reviewDenial({ ...valid, rating: 0 })?.status, 400);
    assert.equal(reviewDenial({ ...valid, rating: Number.NaN })?.status, 400);
  });
});

describe('isActiveMember / memberDenial', () => {
  test('a signed-in, unbanned person may write', () => {
    assert.equal(isActiveMember(member), true);
    assert.equal(isActiveMember({ ...member, role: 'admin' }), true);
  });
  test('a visitor and a banned account may not', () => {
    assert.equal(isActiveMember(undefined), false);
    assert.equal(isActiveMember({ ...member, banned: true }), false);
  });
  test('no session is a 401 and a banned account a 403', async () => {
    const anonymous = memberDenial(undefined);
    assert.equal(anonymous.status, 401);
    assert.deepEqual(await anonymous.json(), { error: 'unauthorized' });
    const banned = memberDenial({ ...member, banned: true });
    assert.equal(banned.status, 403);
    assert.deepEqual(await banned.json(), { error: 'banned' });
  });
  test('an active member is never asked, and defaults to the refusal', () => {
    assert.equal(memberDenial(member).status, 401);
  });
});
