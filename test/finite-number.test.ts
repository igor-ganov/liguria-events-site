import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { finiteNumber } from '../src/lib/finite-number.ts';

describe('finiteNumber', () => {
  test('keeps a real number, zero and negatives included', () => {
    assert.equal(finiteNumber(44.4), 44.4);
    assert.equal(finiteNumber(0), 0);
    assert.equal(finiteNumber(-8.93), -8.93);
  });

  test('rejects a numeric string — coordinates are never parsed from text', () => {
    assert.equal(finiteNumber('44.4'), undefined);
  });

  test('rejects NaN and the infinities', () => {
    assert.equal(finiteNumber(Number.NaN), undefined);
    assert.equal(finiteNumber(Number.POSITIVE_INFINITY), undefined);
    assert.equal(finiteNumber(Number.NEGATIVE_INFINITY), undefined);
  });

  test('rejects absent and non-numeric values', () => {
    assert.equal(finiteNumber(undefined), undefined);
    assert.equal(finiteNumber(true), undefined);
    assert.equal(finiteNumber({}), undefined);
    assert.equal(finiteNumber([]), undefined);
  });
});
