// Where the author lands after the form is accepted.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventRedirectPath } from '../src/components/events/event-redirect-path.ts';

describe('eventRedirectPath', () => {
  test('a fresh event is marked as fresh, so the page can lead with its link', () => {
    assert.equal(eventRedirectPath('create', '', 'abc123'), '/event/abc123?created=1');
  });

  test('an edit goes back to the event, unmarked', () => {
    assert.equal(eventRedirectPath('edit', 'abc123', ''), '/event/abc123');
  });

  test('create uses the id the API returned, not the form’s', () => {
    assert.equal(eventRedirectPath('create', 'stale', 'fresh'), '/event/fresh?created=1');
  });
});
