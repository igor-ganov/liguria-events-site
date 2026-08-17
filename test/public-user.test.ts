import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { publicUser } from '../src/lib/auth/public-user.ts';
import type { AppUser } from '../src/lib/auth/types.ts';

const user: AppUser = {
  id: 'internal-id',
  email: 'a@example.test',
  handle: 'ann',
  role: 'admin',
  banned: true,
};

describe('publicUser', () => {
  test('exposes identity and role', () => {
    assert.deepEqual(publicUser(user), { email: 'a@example.test', handle: 'ann', role: 'admin' });
  });

  test('never leaks the internal id or the ban flag', () => {
    const keys = Object.keys(publicUser(user));
    assert.deepEqual(keys.filter((k) => k === 'id' || k === 'banned'), []);
  });

  test('a member keeps the member role', () => {
    assert.equal(publicUser({ ...user, role: 'member' }).role, 'member');
  });
});
