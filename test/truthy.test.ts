import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { truthy } from '../src/lib/truthy.ts';

describe('truthy', () => {
  test('keeps a value that a guard clause would have let through', () => {
    assert.deepEqual(truthy('a'), ['a']);
    assert.deepEqual(truthy(1), [1]);
    assert.deepEqual(truthy(true), [true]);
  });

  test('drops every value a guard clause would have rejected', () => {
    assert.deepEqual(truthy(''), []);
    assert.deepEqual(truthy(0), []);
    assert.deepEqual(truthy(false), []);
    assert.deepEqual(truthy(undefined), []);
  });

  test("drops the database's empty marker", () => {
    assert.deepEqual(truthy(JSON.parse('null')), []);
  });

  test('spreads an optional property only when present', () => {
    const of = (venue: string) => ({ id: 'e', ...truthy(venue).map((v) => ({ v })).at(0) });
    assert.deepEqual(of('Teatro'), { id: 'e', v: 'Teatro' });
    assert.deepEqual(of(''), { id: 'e' });
    assert.equal(Object.hasOwn(of(''), 'v'), false);
  });
});
