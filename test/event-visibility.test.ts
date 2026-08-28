// Who may open an event page, and whether a search engine may keep it.
//
// The bug this pins down: an event is created, the author is handed a link and
// told "the link works now either way", and then post-write moderation
// overwrites the status with the model's verdict. A `hold` — which is also what
// a transient model failure returns, by design — took the page away from
// everybody except its author. The people the invitation was sent to got 410,
// and the author, who can still see it, had no way to know.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { openableBy } from '../src/lib/events/openable-by.ts';
import { keepOutOfSearch } from '../src/lib/events/keep-out-of-search.ts';

describe('openableBy', () => {
  test('a link that was sent keeps working while moderation runs', () => {
    assert.equal(openableBy('published', false), true);
    assert.equal(openableBy('pending', false), true);
    assert.equal(openableBy('held', false), true);
  });

  test('a rejected event is gone for everybody but its author', () => {
    // A link is shared onward, so a rejection has to take the page down.
    assert.equal(openableBy('rejected', false), false);
    assert.equal(openableBy('rejected', true), true);
  });

  test('an author always sees their own', () => {
    (['published', 'pending', 'held', 'rejected'] as const).forEach((status) =>
      assert.equal(openableBy(status, true), true, status),
    );
  });
});

describe('keepOutOfSearch', () => {
  test('only a published public event belongs in an index', () => {
    assert.equal(keepOutOfSearch('published', 'public'), false);
  });

  test('an event the crawler found has no status, and stays indexable', () => {
    // Reading "no status" as "not published" would put a noindex on every one
    // of the thousands of pages the collector fills.
    assert.equal(keepOutOfSearch(undefined, undefined), false);
  });

  test('link-only is never for search, whatever its status', () => {
    assert.equal(keepOutOfSearch('published', 'link'), true);
    assert.equal(keepOutOfSearch('held', 'link'), true);
  });

  test('a public event still under review is not for search yet', () => {
    // Reachable by its link — that was promised — but not indexable, or a hold
    // would be published by the crawler while a human is still looking at it.
    assert.equal(keepOutOfSearch('pending', 'public'), true);
    assert.equal(keepOutOfSearch('held', 'public'), true);
  });
});
