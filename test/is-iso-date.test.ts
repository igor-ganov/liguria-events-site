import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isIsoDate } from '../src/lib/is-iso-date.ts';

describe('isIsoDate', () => {
  test('accepts a bare calendar date', () => {
    assert.equal(isIsoDate('2026-08-17'), true);
  });

  test('rejects a malformed or partial date', () => {
    assert.equal(isIsoDate(''), false);
    assert.equal(isIsoDate('2026-8-17'), false);
    assert.equal(isIsoDate('2026-08'), false);
    assert.equal(isIsoDate('17/08/2026'), false);
  });

  test('rejects a date with a time attached', () => {
    assert.equal(isIsoDate('2026-08-17T10:00:00Z'), false);
  });
});
