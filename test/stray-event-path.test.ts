// Crawlers ask this site for URLs it has never published: an event id dropped
// into the slot where a city slug belongs — /it/puglia/51a5e3abbc8f/. Three of
// them did it 59 674 times in one day. The ids are real and the events are
// alive, so the answer is where the event lives, not a 404.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { strayEventPath } from '../src/lib/events/stray-event-path.ts';

describe('strayEventPath', () => {
  test('an event id standing where a city should be points at the event', () => {
    assert.equal(strayEventPath('/it/puglia/51a5e3abbc8f/'), '/it/event/51a5e3abbc8f/');
    assert.equal(strayEventPath('/campania/bab135a46427/'), '/event/bab135a46427/');
    assert.equal(strayEventPath('/ru/emilia-romagna/e18b9b1bc3c7/'), '/ru/event/e18b9b1bc3c7/');
  });

  test('a missing trailing slash is still the same address', () => {
    assert.equal(strayEventPath('/campania/bab135a46427'), '/event/bab135a46427/');
  });

  test('every real page is left alone', () => {
    ['/liguria/', '/liguria/genova/', '/liguria/genova/teatro-carlo-felice/', '/it/liguria/calendar/', '/event/51a5e3abbc8f/', '/it/event/51a5e3abbc8f/', '/', '/submit/'].forEach(
      (path) => assert.equal(strayEventPath(path), undefined, path),
    );
  });

  test('the region has to be a real one, and the tail a real id', () => {
    // Otherwise this becomes a catch-all that redirects genuine nonsense.
    assert.equal(strayEventPath('/nowhere/51a5e3abbc8f/'), undefined);
    assert.equal(strayEventPath('/puglia/not-an-id/'), undefined);
    assert.equal(strayEventPath('/xx/puglia/51a5e3abbc8f/'), undefined);
  });
});
