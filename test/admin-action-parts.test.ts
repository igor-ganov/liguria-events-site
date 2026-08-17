// Pure decisions behind the admin users table: which handler a clicked button
// runs, and what (if anything) that click asks the server to do.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { adminActions } from '../src/components/admin/admin-actions.ts';
import { eventActionBody } from '../src/components/admin/event-action-body.ts';
import { userActionBody } from '../src/components/admin/user-action-body.ts';
import type { AdminPrompts } from '../src/components/admin/user-action-body.ts';

const prompts = (over: Partial<AdminPrompts> = {}): AdminPrompts => ({
  prompt: () => 'spam',
  confirm: () => true,
  ...over,
});

describe('adminActions', () => {
  test('a button with no admin hook does nothing', () => {
    assert.deepEqual(adminActions({}), []);
    assert.deepEqual(adminActions({ other: 'x' }), []);
  });
  test('an expander only expands, never acts', () => {
    assert.deepEqual(adminActions({ toggle: 'u1' }), ['toggle']);
    assert.deepEqual(adminActions({ toggle: 'u1', userAction: 'ban' }), ['toggle']);
  });
  test('an acting button runs its own handler', () => {
    assert.deepEqual(adminActions({ userAction: 'ban' }), ['user']);
    assert.deepEqual(adminActions({ action: 'approve' }), ['event']);
  });
  test('an empty hook value still counts — the attribute is the signal', () => {
    assert.deepEqual(adminActions({ toggle: '' }), ['toggle']);
  });
});

describe('userActionBody', () => {
  test('a plain action goes with no reason', () => {
    assert.deepEqual(userActionBody('u1', 'promote', prompts()), [
      { id: 'u1', action: 'promote', reason: '' },
    ]);
  });
  test('a ban carries the typed reason', () => {
    assert.deepEqual(userActionBody('u1', 'ban', prompts({ prompt: () => 'abuse' })), [
      { id: 'u1', action: 'ban', reason: 'abuse' },
    ]);
  });
  test('a cancelled or empty ban prompt sends nothing', () => {
    assert.deepEqual(userActionBody('u1', 'ban', prompts({ prompt: () => undefined })), []);
    assert.deepEqual(userActionBody('u1', 'ban', prompts({ prompt: () => '' })), []);
  });
  test('a purge needs its confirmation', () => {
    assert.deepEqual(userActionBody('u1', 'delete_events', prompts()), [
      { id: 'u1', action: 'delete_events', reason: '' },
    ]);
    assert.deepEqual(
      userActionBody('u1', 'delete_events', prompts({ confirm: () => false })),
      [],
    );
  });
  test('a missing id or action sends nothing', () => {
    assert.deepEqual(userActionBody(undefined, 'promote', prompts()), []);
    assert.deepEqual(userActionBody('u1', undefined, prompts()), []);
    assert.deepEqual(userActionBody('', 'promote', prompts()), []);
    assert.deepEqual(userActionBody('u1', '', prompts()), []);
  });
  test('only a ban ever asks a question', () => {
    let asked = 0;
    userActionBody('u1', 'promote', prompts({ prompt: () => ((asked += 1), 'x') }));
    assert.equal(asked, 0);
  });
});

describe('eventActionBody', () => {
  test('carries the submission id and the action', () => {
    assert.deepEqual(eventActionBody('e1', 'approve'), [{ id: 'e1', action: 'approve' }]);
  });
  test('a missing id or action sends nothing', () => {
    assert.deepEqual(eventActionBody(undefined, 'approve'), []);
    assert.deepEqual(eventActionBody('e1', undefined), []);
    assert.deepEqual(eventActionBody('', ''), []);
  });
});
