// Which pages the worker may keep, so that a reader with no signal still has
// a site.
//
// The first service worker kept none of them, deliberately: this site renders
// pages on the server, some of them for the person signed in, and a page
// replayed from storage is an event whose time may have changed and — on a
// shared device — somebody else's page. That reasoning was right about the
// risk and wrong about the conclusion. The answer is not "keep nothing", it is
// "keep the pages that belong to everybody, and drop the lot the moment the
// viewer changes".
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isCacheablePage } from '../src/sw/is-cacheable-page.ts';
import { stalenessParts } from '../src/lib/pwa/staleness-parts.ts';

describe('isCacheablePage', () => {
  test('the pages anybody would see are kept', () => {
    ['/liguria/', '/liguria/calendar/', '/liguria/genova/', '/it/liguria/', '/favorites/'].forEach((path) => {
      assert.ok(isCacheablePage(path), path);
    });
  });

  test('an event page is kept — it is the one people come back to', () => {
    assert.ok(isCacheablePage('/event/concerto-in-cortile-2026-12-05-51a5e3abbc8f/'));
    assert.ok(isCacheablePage('/it/event/concerto-in-cortile-2026-12-05-51a5e3abbc8f/'));
  });

  test('a page rendered for one person is never kept', () => {
    // Not caution for its own sake: these carry a draft, an email address, or
    // somebody's own list, and this cache is shared by everyone on the device.
    ['/submit/', '/it/submit/', '/settings/', '/admin/', '/admin/users/'].forEach((path) => {
      assert.equal(isCacheablePage(path), false, path);
    });
  });

  test("an event being edited is its author's, not the device's", () => {
    assert.equal(isCacheablePage('/event/x-51a5e3abbc8f/edit/'), false);
  });

  test('nothing that is not a page is kept here', () => {
    ['/api/auth/me', '/auth/verify', '/og/51a5e3abbc8f.png', '/uploads/a.jpg'].forEach((path) => {
      assert.equal(isCacheablePage(path), false, path);
    });
  });
});

describe('stalenessParts', () => {
  const stored = new Date('2026-09-05T10:00:00Z').getTime();
  const after = (iso: string): number => new Date(iso).getTime();

  test('says how old a kept page is, as a number and a unit', () => {
    // A number and a unit rather than a sentence, because the sentence has to
    // exist in three languages and Intl.RelativeTimeFormat already writes it.
    assert.deepEqual(stalenessParts(stored, after('2026-09-05T10:40:00Z')), { value: 40, unit: 'minute' });
    assert.deepEqual(stalenessParts(stored, after('2026-09-05T13:00:00Z')), { value: 3, unit: 'hour' });
    assert.deepEqual(stalenessParts(stored, after('2026-09-07T10:00:00Z')), { value: 2, unit: 'day' });
    assert.deepEqual(stalenessParts(stored, after('2026-09-05T10:01:00Z')), { value: 1, unit: 'minute' });
  });

  test('under a minute is not worth saying', () => {
    assert.equal(stalenessParts(stored, after('2026-09-05T10:00:30Z')), undefined);
  });

  test('a clock that went backwards is not a page from the future', () => {
    assert.equal(stalenessParts(stored, after('2026-09-05T09:00:00Z')), undefined);
  });
});
