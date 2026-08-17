// Pure helpers pulled out of src/pages/api/routes.ts and routes/[id].ts.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { anonymousEditToken } from '../src/lib/favorites/anonymous-edit-token.ts';
import { bannedDenial } from '../src/lib/auth/banned-denial.ts';
import { editTokenPart } from '../src/lib/favorites/edit-token-part.ts';
import { jsonValue } from '../src/lib/json-value.ts';
import { newRouteId } from '../src/lib/favorites/new-route-id.ts';
import { routeEditMode } from '../src/lib/favorites/route-edit-mode.ts';
import { routeIsPublic } from '../src/lib/favorites/route-is-public.ts';
import { routeRegion } from '../src/lib/favorites/route-region.ts';
import { trimmedString } from '../src/lib/trimmed-string.ts';
import type { AppUser } from '../src/lib/auth/types.ts';
import type { SavedRoute } from '../src/lib/favorites/saved-route.ts';

const member: AppUser = {
  id: 'u1',
  email: 'someone@example.test',
  handle: 'someone',
  role: 'member',
  banned: false,
};

const route = (userId: string | undefined): SavedRoute => ({
  id: 'r1',
  name: 'Weekend',
  region: 'liguria',
  data: '{}',
  public: true,
  userId,
  createdAt: 1_760_000_000,
});

describe('trimmedString', () => {
  test('trims and caps a string field', () => {
    assert.equal(trimmedString('  hello  ', 40), 'hello');
    assert.equal(trimmedString('abcdef', 3), 'abc');
  });
  test('anything that is not a string reads as empty', () => {
    assert.equal(trimmedString(42, 40), '');
    assert.equal(trimmedString(undefined, 40), '');
    assert.equal(trimmedString({}, 40), '');
  });
});

describe('jsonValue', () => {
  test('reads an own field of any shape', () => {
    assert.equal(jsonValue({ public: true }, 'public'), true);
    assert.equal(jsonValue({ rating: 4 }, 'rating'), 4);
    assert.equal(jsonValue({ data: 'x' }, 'data'), 'x');
  });
  test('a missing field, or no object at all, reads as nothing', () => {
    assert.equal(jsonValue({}, 'public'), undefined);
    assert.equal(jsonValue(undefined, 'public'), undefined);
    assert.equal(jsonValue('a string', 'public'), undefined);
  });
  test('an inherited member is not a field', () => {
    assert.equal(jsonValue({}, 'constructor'), undefined);
    assert.equal(jsonValue({}, 'toString'), undefined);
  });
});

describe('routeRegion', () => {
  test('a known region is kept', () => {
    assert.equal(routeRegion('liguria'), 'liguria');
  });
  test('anything unknown falls back to liguria', () => {
    assert.equal(routeRegion('atlantis'), 'liguria');
    assert.equal(routeRegion(42), 'liguria');
    assert.equal(routeRegion(undefined), 'liguria');
  });
});

describe('routeIsPublic', () => {
  test("an anonymous route is public whatever the body says", () => {
    assert.equal(routeIsPublic(false, {}), true);
    assert.equal(routeIsPublic(false, { public: false }), true);
  });
  test('an owned route is private unless public: true was sent', () => {
    assert.equal(routeIsPublic(true, { public: true }), true);
    assert.equal(routeIsPublic(true, { public: 'true' }), false);
    assert.equal(routeIsPublic(true, {}), false);
  });
});

describe('anonymousEditToken / editTokenPart / newRouteId', () => {
  test('only an anonymous route gets an edit token', () => {
    assert.equal(anonymousEditToken(true), undefined);
    assert.match(anonymousEditToken(false) ?? '', /^[0-9a-f]{32}$/);
  });
  test('the token key is present only when there is a token', () => {
    assert.deepEqual(editTokenPart('abc'), { editToken: 'abc' });
    assert.equal(editTokenPart(undefined), undefined);
    assert.deepEqual({ id: 'r1', ...editTokenPart(undefined) }, { id: 'r1' });
  });
  test('a route id is short and unguessable', () => {
    assert.match(newRouteId(), /^r[0-9a-f]{11}$/);
    assert.notEqual(newRouteId(), newRouteId());
  });
});

describe('routeEditMode', () => {
  test('the owner edits their own route', () => {
    assert.equal(routeEditMode(route('u1'), 'u1'), 'owner');
  });
  test('an owner-less route is editable by whoever holds the token', () => {
    assert.equal(routeEditMode(route(undefined), undefined), 'anonymous');
    assert.equal(routeEditMode(route(undefined), 'u1'), 'anonymous');
  });
  test("nobody else may touch another person's route", () => {
    assert.equal(routeEditMode(route('u2'), 'u1'), 'forbidden');
    assert.equal(routeEditMode(route('u2'), undefined), 'forbidden');
  });
});

describe('bannedDenial', () => {
  test('a banned account may not save a route', async () => {
    const denial = bannedDenial({ ...member, banned: true });
    assert.equal(denial?.status, 403);
    assert.deepEqual(await denial?.json(), { error: 'banned' });
  });
  test('a member and an anonymous visitor both pass', () => {
    assert.equal(bannedDenial(member), undefined);
    assert.equal(bannedDenial(undefined), undefined);
  });
});
