import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { stringList } from '../src/lib/string-list.ts';

describe('stringList', () => {
  test('keeps the strings of an array, in order', () => {
    assert.deepEqual(stringList(['music', 'art']), ['music', 'art']);
  });

  test('drops non-string members rather than the whole array', () => {
    assert.deepEqual(stringList(['music', 7, undefined, { a: 1 }, 'art']), ['music', 'art']);
  });

  test('anything that is not an array reads as nothing', () => {
    assert.deepEqual(stringList('music'), []);
    assert.deepEqual(stringList(undefined), []);
    assert.deepEqual(stringList({ 0: 'music' }), []);
    assert.deepEqual(stringList(JSON.parse('null')), []);
  });

  test('an empty array reads as nothing', () => {
    assert.deepEqual(stringList([]), []);
  });
});
