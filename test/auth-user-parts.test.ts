// Pure helpers pulled out of src/lib/auth/users.ts.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { handleFromEmail } from '../src/lib/auth/handle-from-email.ts';
import { isRootAdmin } from '../src/lib/auth/is-root-admin.ts';
import { needsRootRepair } from '../src/lib/auth/needs-root-repair.ts';
import { rootAdmins } from '../src/lib/auth/root-admins.ts';
import { toUser } from '../src/lib/auth/to-user.ts';
import type { UserRow } from '../src/lib/auth/user-row.ts';

const row = (over: Partial<UserRow> = {}): UserRow => ({
  id: 'u1',
  email: 'someone@example.test',
  handle: 'someone',
  role: 'member',
  banned: 0,
  ...over,
});

describe('toUser', () => {
  test('only the exact role admin is an admin', () => {
    assert.equal(toUser(row({ role: 'admin' })).role, 'admin');
    assert.equal(toUser(row({ role: 'member' })).role, 'member');
    assert.equal(toUser(row({ role: 'Admin' })).role, 'member');
    assert.equal(toUser(row({ role: '' })).role, 'member');
  });
  test('only banned = 1 is banned', () => {
    assert.equal(toUser(row({ banned: 1 })).banned, true);
    assert.equal(toUser(row({ banned: 0 })).banned, false);
    assert.equal(toUser(row({ banned: 2 })).banned, false);
  });
  test('carries the identity across untouched', () => {
    assert.deepEqual(toUser(row()), {
      id: 'u1',
      email: 'someone@example.test',
      handle: 'someone',
      role: 'member',
      banned: false,
    });
  });
});

describe('handleFromEmail', () => {
  test('keeps letters and digits of the local part, lowercased', () => {
    assert.equal(handleFromEmail('Anna.Rossi+news@example.test'), 'annarossinews');
  });
  test('caps the handle at 20 characters', () => {
    assert.equal(handleFromEmail('abcdefghijklmnopqrstuvwxyz@example.test'), 'abcdefghijklmnopqrst');
  });
  test('falls back to user when nothing survives', () => {
    assert.equal(handleFromEmail('+++@example.test'), 'user');
    assert.equal(handleFromEmail(''), 'user');
  });
});

describe('rootAdmins / isRootAdmin', () => {
  test('reads a comma list, trimmed and lowercased, blanks dropped', () => {
    assert.deepEqual(rootAdmins({ ADMIN_EMAILS: ' Boss@Example.test , ,second@example.test ' }), [
      'boss@example.test',
      'second@example.test',
    ]);
    assert.deepEqual(rootAdmins({}), []);
    assert.deepEqual(rootAdmins({ ADMIN_EMAILS: '' }), []);
  });
  test('membership ignores case and surrounding space', () => {
    const admins = rootAdmins({ ADMIN_EMAILS: 'boss@example.test' });
    assert.equal(isRootAdmin(' BOSS@example.test ', admins), true);
    assert.equal(isRootAdmin('someone@example.test', admins), false);
    assert.equal(isRootAdmin('boss@example.test', []), false);
  });
});

describe('needsRootRepair', () => {
  test('a root admin that was demoted or banned is repaired', () => {
    assert.equal(needsRootRepair(row({ role: 'member' }), true), true);
    assert.equal(needsRootRepair(row({ role: 'admin', banned: 1 }), true), true);
  });
  test('an intact root admin is left alone', () => {
    assert.equal(needsRootRepair(row({ role: 'admin', banned: 0 }), true), false);
  });
  test('nobody else is ever repaired', () => {
    assert.equal(needsRootRepair(row({ role: 'member', banned: 1 }), false), false);
    assert.equal(needsRootRepair(row({ role: 'admin' }), false), false);
  });
});
