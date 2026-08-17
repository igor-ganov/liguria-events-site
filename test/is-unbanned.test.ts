import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isUnbanned } from '../src/lib/auth/is-unbanned.ts';
import type { AppUser } from '../src/lib/auth/types.ts';

const user = (banned: boolean): AppUser => ({
  id: 'u1',
  email: 'a@b.c',
  handle: 'anna',
  role: 'member',
  banned,
});

describe('isUnbanned', () => {
  test('an ordinary account may write', () => {
    assert.equal(isUnbanned(user(false)), true);
  });

  test('a banned account may not', () => {
    assert.equal(isUnbanned(user(true)), false);
  });
});
