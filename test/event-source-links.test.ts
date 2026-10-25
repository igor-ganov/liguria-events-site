import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventLinks } from '../src/lib/events/event-links.ts';
import { sourceOf } from '../src/lib/events/source-of.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Concerto',
  s: '2026-08-05',
  c: ['music'],
  u: 'https://www.mentelocale.it/genova/eventi/1',
  ...over,
});

describe('sourceOf', () => {
  test('names a known source from its host', () => {
    assert.equal(sourceOf(ev()), 'mentelocale');
  });

  test('an unknown host is its own name', () => {
    assert.equal(sourceOf(ev({ u: 'https://example.org/x' })), 'example.org');
  });

  test('an event submitted on the site has no source, and that is not a crash', () => {
    // The detail page rendered a user-submitted event through this: `new URL('')`
    // threw and took the whole route down with a 500.
    assert.equal(sourceOf(ev({ u: '' })), '');
    assert.equal(sourceOf(ev({ u: 'not a url' })), '');
  });
});

describe('eventLinks', () => {
  test('primary first, then the other sources, deduped', () => {
    const links = eventLinks(
      ev({ l: [{ source: 'visitgenoa', url: 'https://visitgenoa.it/a' }, { source: 'x', url: 'https://www.mentelocale.it/genova/eventi/1' }] }),
    );
    assert.deepEqual(links.map((link) => link.url), [
      'https://www.mentelocale.it/genova/eventi/1',
      'https://visitgenoa.it/a',
    ]);
  });

  test('one link per source: the pages of a show sold date by date are one source', () => {
    // The crawler folds a show Ticketmaster sells date by date into one event
    // and keeps every other date's page as a link — 83 of them for one
    // exhibition. A reader wants to know who says so, once each.
    const links = eventLinks(
      ev({
        u: 'https://www.ticketmaster.it/event/banksy-25-10',
        l: [
          { source: 'ticketmaster', url: 'https://www.ticketmaster.it/event/banksy-26-10' },
          { source: 'mentelocale', url: 'https://www.mentelocale.it/torino/1' },
          { source: 'ticketmaster', url: 'https://www.ticketmaster.it/event/banksy-27-10' },
        ],
      }),
    );
    assert.deepEqual(links.map((link) => link.url), [
      'https://www.ticketmaster.it/event/banksy-25-10',
      'https://www.mentelocale.it/torino/1',
    ]);
  });

  test('an event with no source link renders no link at all', () => {
    assert.deepEqual(eventLinks(ev({ u: '' })), []);
  });
});
