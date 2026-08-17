// Pure helpers pulled out of src/pages/api/admin/user.ts.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isActiveAdmin } from '../src/lib/admin/is-active-admin.ts';
import { rootAdminDenial } from '../src/lib/admin/root-admin-denial.ts';
import { userActionDenial } from '../src/lib/admin/user-action-denial.ts';
import { userActionHandler } from '../src/lib/admin/user-action-handler.ts';
import { userActionRequest } from '../src/lib/admin/user-action-request.ts';
import type { AppUser } from '../src/lib/auth/types.ts';

const admin: AppUser = {
  id: 'a1',
  email: 'boss@example.test',
  handle: 'boss',
  role: 'admin',
  banned: false,
};
const target = { id: 'u2', email: 'someone@example.test', handle: 'someone' };
const admins = ['boss@example.test'];

const body = async (res: Response | undefined): Promise<unknown> => await (res ?? new Response('{}')).json();

describe('isActiveAdmin', () => {
  test('only a signed-in, unbanned admin may act', () => {
    assert.equal(isActiveAdmin(admin), true);
  });
  test('a visitor, a member and a banned admin are all refused', () => {
    assert.equal(isActiveAdmin(undefined), false);
    assert.equal(isActiveAdmin({ ...admin, role: 'member' }), false);
    assert.equal(isActiveAdmin({ ...admin, banned: true }), false);
  });
});

describe('userActionRequest', () => {
  test('reads the three fields', () => {
    assert.deepEqual(userActionRequest({ id: 'u2', action: 'ban', reason: 'spam' }), {
      id: 'u2',
      action: 'ban',
      reason: 'spam',
    });
  });
  test('a field of another shape, or no body, reads as empty', () => {
    assert.deepEqual(userActionRequest({ id: 42, action: {}, reason: [] }), {
      id: '',
      action: '',
      reason: '',
    });
    assert.deepEqual(userActionRequest(undefined), { id: '', action: '', reason: '' });
    assert.deepEqual(userActionRequest('nonsense'), { id: '', action: '', reason: '' });
  });
  test('the reason is capped at 300 characters', () => {
    assert.equal(userActionRequest({ reason: 'x'.repeat(400) }).reason.length, 300);
  });
});

describe('userActionDenial', () => {
  test('an action without a target id is a 400 bad_request', async () => {
    const denial = userActionDenial({ id: '', action: 'ban', reason: '' }, admin);
    assert.equal(denial?.status, 400);
    assert.deepEqual(await body(denial), { error: 'bad_request' });
  });
  test('an admin may not act on themselves', async () => {
    const denial = userActionDenial({ id: admin.id, action: 'demote', reason: '' }, admin);
    assert.equal(denial?.status, 400);
    assert.deepEqual(await body(denial), { error: 'self' });
  });
  test('a real target passes', () => {
    assert.equal(userActionDenial({ id: 'u2', action: 'ban', reason: '' }, admin), undefined);
  });
});

describe('rootAdminDenial', () => {
  test('a root admin may not be demoted, banned or purged', async () => {
    const denial = rootAdminDenial({ ...target, email: 'Boss@Example.test' }, 'ban', admins);
    assert.equal(denial?.status, 400);
    assert.deepEqual(await body(denial), { error: 'root_admin' });
    assert.equal(rootAdminDenial({ ...target, email: 'boss@example.test' }, 'demote', admins)?.status, 400);
    assert.equal(
      rootAdminDenial({ ...target, email: 'boss@example.test' }, 'delete_events', admins)?.status,
      400,
    );
  });
  test('promoting a root admin is still allowed', () => {
    assert.equal(rootAdminDenial({ ...target, email: 'boss@example.test' }, 'promote', admins), undefined);
  });
  test('everyone else passes', () => {
    assert.equal(rootAdminDenial(target, 'ban', admins), undefined);
    assert.equal(rootAdminDenial({ ...target, email: 'boss@example.test' }, 'ban', []), undefined);
  });
});

describe('userActionHandler', () => {
  test('the five actions are the only ones that exist', () => {
    const known = ['promote', 'demote', 'ban', 'unban', 'delete_events'];
    assert.equal(known.every((action) => userActionHandler(action) !== undefined), true);
  });
  test('anything else has no handler, so the endpoint answers 400', () => {
    assert.equal(userActionHandler(''), undefined);
    assert.equal(userActionHandler('delete'), undefined);
    assert.equal(userActionHandler('BAN'), undefined);
  });
  test('an inherited member is not an action', () => {
    assert.equal(userActionHandler('constructor'), undefined);
    assert.equal(userActionHandler('toString'), undefined);
  });
});
