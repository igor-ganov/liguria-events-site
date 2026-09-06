// What the offline page can offer.
//
// The app's launch URL is "/", which redirects to a region — so it is never
// itself cached, and a reader who had just been reading the feed was shown
// "no connection" over a cache that had the feed in it. The offline page now
// lists what IS there, and these are the words it lists them with.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { offlineLabel } from '../src/lib/pwa/offline-label.ts';

describe('offlineLabel', () => {
  test('names a region feed by its region', () => {
    assert.equal(offlineLabel('/liguria/'), 'Liguria');
    assert.equal(offlineLabel('/emilia-romagna/'), 'Emilia Romagna');
  });

  test('names a section under it', () => {
    assert.equal(offlineLabel('/liguria/calendar/'), 'Liguria · Calendar');
    assert.equal(offlineLabel('/liguria/genova/'), 'Liguria · Genova');
  });

  test('an event is named as an event, not as its slug', () => {
    // The slug is forty characters of words and an id. Reading it back to
    // somebody as a link title would be worse than saying nothing.
    assert.equal(offlineLabel('/event/concerto-in-cortile-2026-12-05-51a5e3abbc8f/'), 'Concerto in cortile');
  });

  test('a language prefix is not part of the name', () => {
    assert.equal(offlineLabel('/it/liguria/'), 'Liguria');
    assert.equal(offlineLabel('/ru/liguria/calendar/'), 'Liguria · Calendar');
  });

  test('the pages that are just themselves keep their own word', () => {
    assert.equal(offlineLabel('/favorites/'), 'Favorites');
  });
});
