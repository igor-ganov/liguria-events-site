import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { equalConstantTime } from '../src/lib/auth/equal-constant-time.ts';

describe('equalConstantTime', () => {
  test('equal strings match', () => {
    assert.equal(equalConstantTime('abc123', 'abc123'), true);
  });

  test('a difference in the first position is caught', () => {
    assert.equal(equalConstantTime('abc', 'zbc'), false);
  });

  test('a difference in the last position is caught', () => {
    assert.equal(equalConstantTime('abc', 'abz'), false);
  });

  test('two empty strings match', () => {
    assert.equal(equalConstantTime('', ''), true);
  });

  test('case matters', () => {
    assert.equal(equalConstantTime('Abc', 'abc'), false);
  });

  test('a truncated candidate is rejected', () => {
    assert.equal(equalConstantTime('abc', 'ab'), false);
  });
});
