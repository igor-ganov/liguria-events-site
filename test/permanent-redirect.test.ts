import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { permanentRedirect } from '../src/lib/http/permanent-redirect.ts';

describe('permanentRedirect', () => {
  test('moves the caller and says so permanently', () => {
    const response = permanentRedirect('/it/event/51a5e3abbc8f/');
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), '/it/event/51a5e3abbc8f/');
  });
  test('may be remembered, so a crawler asking again costs nothing', () => {
    // Tens of thousands of these a day, all for addresses the site never linked.
    const cache = permanentRedirect('/x').headers.get('cache-control') ?? '';
    assert.match(cache, /public/);
    assert.match(cache, /max-age=\d{4,}/);
  });
});
