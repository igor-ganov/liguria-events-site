import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { routeInsert } from '../src/lib/favorites/route-insert.ts';
import { ROUTE_SELECT_COLS } from '../src/lib/favorites/route-select-cols.ts';
import { toSavedRoute } from '../src/lib/favorites/to-saved-route.ts';
import type { RouteInput, RouteRow } from '../src/lib/favorites/saved-route.ts';

const row: RouteRow = {
  id: 'r1',
  name: 'Weekend',
  region: 'liguria',
  data: '{"days":[]}',
  public: 1,
  userId: 'u1',
  createdAt: 1_760_000_000,
};

const input: RouteInput = {
  id: 'r1',
  userId: 'u1',
  name: 'Weekend',
  region: 'liguria',
  data: '{"days":[]}',
  isPublic: true,
};

describe('toSavedRoute', () => {
  test('expands a row: 1 is public, the owner is kept', () => {
    assert.deepEqual(toSavedRoute(row), {
      id: 'r1',
      name: 'Weekend',
      region: 'liguria',
      data: '{"days":[]}',
      public: true,
      userId: 'u1',
      createdAt: 1_760_000_000,
    });
  });

  test('0 is private and anything else is not public either', () => {
    assert.equal(toSavedRoute({ ...row, public: 0 }).public, false);
    assert.equal(toSavedRoute({ ...row, public: 2 }).public, false);
  });

  test('a NULL owner (an anonymous route) folds to undefined', () => {
    assert.equal(toSavedRoute({ ...row, userId: undefined }).userId, undefined);
  });
});

describe('ROUTE_SELECT_COLS', () => {
  test('aliases the snake_case columns to the row field names', () => {
    assert.ok(ROUTE_SELECT_COLS.includes('user_id AS userId'));
    assert.ok(ROUTE_SELECT_COLS.includes('created_at AS createdAt'));
  });
});

describe('routeInsert', () => {
  test('an owned route binds the owner and its visibility flag', () => {
    const { sql, values } = routeInsert(input, 42);
    assert.ok(sql.includes('(id, user_id, name, region, data, public, created_at)'));
    assert.deepEqual(values, ['r1', 'u1', 'Weekend', 'liguria', '{"days":[]}', 1, 42]);
  });

  test('a private owned route binds 0', () => {
    assert.deepEqual(routeInsert({ ...input, isPublic: false }, 42).values.at(5), 0);
  });

  test('an anonymous route omits user_id (SQL NULL owner) and binds its edit token', () => {
    const { sql, values } = routeInsert({ ...input, userId: undefined, editToken: 'secret' }, 42);
    assert.ok(sql.includes('(id, name, region, data, public, created_at, edit_token)'));
    assert.ok(!sql.includes('user_id'));
    assert.deepEqual(values, ['r1', 'Weekend', 'liguria', '{"days":[]}', 1, 42, 'secret']);
  });

  test('a token-less anonymous route binds an empty token, never undefined', () => {
    assert.equal(routeInsert({ ...input, userId: undefined }, 42).values.at(6), '');
  });

  test('both statements upsert on id', () => {
    assert.ok(routeInsert(input, 1).sql.includes('ON CONFLICT(id) DO UPDATE SET'));
    assert.ok(routeInsert({ ...input, userId: undefined }, 1).sql.includes('ON CONFLICT(id) DO UPDATE SET'));
  });
});
