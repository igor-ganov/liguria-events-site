import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isAdmin } from '../src/lib/admin/is-admin.ts';
import type { AppUser } from '../src/lib/auth/types.ts';

const user = (over: Partial<AppUser> = {}): AppUser => ({
  id: 'u1',
  email: 'a@b.c',
  handle: 'anna',
  role: 'member',
  banned: false,
  ...over,
});

describe('isAdmin', () => {
  test('an admin may act', () => {
    assert.equal(isAdmin(user({ role: 'admin' })), true);
  });

  test('a member may not', () => {
    assert.equal(isAdmin(user()), false);
  });

  test('nobody signed in may not', () => {
    assert.equal(isAdmin(undefined), false);
  });

  // Deliberate: the event moderation endpoint never tested `banned`, and
  // tightening a refusal during a refactor would be a behaviour change.
  test('a banned admin is still an admin here', () => {
    assert.equal(isAdmin(user({ role: 'admin', banned: true })), true);
  });
});
