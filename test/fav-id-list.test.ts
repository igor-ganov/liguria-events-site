import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { favIdList } from '../src/lib/favorites/fav-id-list.ts';

describe('favIdList', () => {
  test('keeps the ids in order', () => {
    assert.deepEqual(favIdList(['abc123abc123', 'wd:Q42', 'osm:node/7']), [
      'abc123abc123',
      'wd:Q42',
      'osm:node/7',
    ]);
  });

  test('drops entries that are not ids', () => {
    assert.deepEqual(favIdList(['ok', 1, undefined, { id: 'x' }, 'with space']), ['ok']);
  });

  test('anything that is not an array is an empty list', () => {
    assert.deepEqual(favIdList(undefined), []);
    assert.deepEqual(favIdList('abc'), []);
    assert.deepEqual(favIdList({ 0: 'abc' }), []);
  });

  test('one request cannot merge an unbounded set', () => {
    const many = Array.from({ length: 600 }, (_, i) => `id${i}`);
    assert.equal(favIdList(many).length, 500);
    assert.equal(favIdList(many).at(-1), 'id499');
  });
});
