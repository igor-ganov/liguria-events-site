import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventAction } from '../src/lib/admin/event-action.ts';

// The action name arrives in a request body, so the lookup must answer for the
// three real actions and for absolutely nothing else.
describe('eventAction', () => {
  test('publish sets the published status, newest timestamp last-but-one', () => {
    const spec = eventAction('publish');
    assert.match(spec?.sql ?? '', /^UPDATE events SET status = \?, updated_at = \? WHERE id = \?$/);
    assert.deepEqual(spec?.bindings('e1', 'NOW'), ['published', 'NOW', 'e1']);
    assert.equal(spec?.log, 'admin_publish');
  });

  test('reject sets the rejected status', () => {
    const spec = eventAction('reject');
    assert.deepEqual(spec?.bindings('e1', 'NOW'), ['rejected', 'NOW', 'e1']);
    assert.equal(spec?.log, 'admin_reject');
  });

  test('delete removes the row and binds the id alone', () => {
    const spec = eventAction('delete');
    assert.equal(spec?.sql, 'DELETE FROM events WHERE id = ?');
    assert.deepEqual(spec?.bindings('e1', 'NOW'), ['e1']);
    assert.equal(spec?.log, 'admin_delete');
  });

  test('an unknown action has no spec', () => {
    assert.equal(eventAction('nope'), undefined);
    assert.equal(eventAction(''), undefined);
  });

  test('an inherited object member is not an action', () => {
    assert.equal(eventAction('constructor'), undefined);
    assert.equal(eventAction('toString'), undefined);
    assert.equal(eventAction('__proto__'), undefined);
  });
});
