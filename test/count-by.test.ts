import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { countBy } from '../src/lib/count-by.ts';

describe('countBy', () => {
  test('counts repeats', () => {
    assert.deepEqual([...countBy(['a', 'b', 'a', 'a']).entries()], [
      ['a', 3],
      ['b', 1],
    ]);
  });

  test('keeps first-seen order', () => {
    assert.deepEqual([...countBy(['z', 'a', 'z']).keys()], ['z', 'a']);
  });

  test('an empty input tallies nothing', () => {
    assert.equal(countBy([]).size, 0);
  });

  test('works for non-string keys', () => {
    assert.equal(countBy([1, 2, 1]).get(1), 2);
  });
});
