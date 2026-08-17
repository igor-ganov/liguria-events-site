import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { sqlFlag } from '../src/lib/sql-flag.ts';

describe('sqlFlag', () => {
  test('true is stored as 1', () => {
    assert.equal(sqlFlag(true), 1);
  });

  test('false is stored as 0', () => {
    assert.equal(sqlFlag(false), 0);
  });
});
