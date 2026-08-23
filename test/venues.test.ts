import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventsOfVenue } from '../src/lib/events/events-of-venue.ts';
import { feedEvents } from '../src/lib/events/feed-events.ts';
import { venuePath } from '../src/lib/events/venue-path.ts';
import { venuesOf } from '../src/lib/events/venues-of.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

let n = 0;
const ev = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: `e${(n += 1)}`,
  t: 'Concerto',
  s: '2026-08-20',
  c: ['music'],
  u: 'https://source/1',
  rg: 'liguria',
  ct: 'genova',
  v: 'Teatro Carlo Felice',
  ...over,
});

const many = (count: number, over: Partial<CompactEvent> = {}): CompactEvent[] =>
  Array.from({ length: count }, () => ev(over));

describe('venuesOf', () => {
  test('a venue with enough events earns a page; a one-off does not', () => {
    // A stub page that ranks for a city is worse than no page.
    const venues = venuesOf([...many(3), ...many(1, { v: 'Bar Sotto Casa' })]);
    assert.deepEqual(venues.map((venue) => venue.slug), ['teatro-carlo-felice']);
    assert.equal(venues[0]?.count, 3);
  });

  test('two spellings of one theatre are one page, not two', () => {
    const venues = venuesOf([
      ...many(2),
      ...many(2, { v: 'teatro  carlo felice' }),
    ]);
    assert.equal(venues.length, 1);
    assert.equal(venues[0]?.count, 4);
  });

  test('the city masquerading as a venue is not a venue', () => {
    // The crawler fills `v` with the city's own name often enough to matter:
    // 55 events in the live corpus said venue "Milano" in city Milano.
    assert.deepEqual(venuesOf(many(5, { ct: 'milano', rg: 'lombardia', v: 'Milano' })), []);
  });

  test('the same venue name in two cities is two pages', () => {
    const venues = venuesOf([
      ...many(3, { v: 'Teatro Comunale' }),
      ...many(3, { v: 'Teatro Comunale', ct: 'milano', rg: 'lombardia' }),
    ]);
    assert.equal(venues.length, 2);
    assert.deepEqual([...new Set(venues.map((venue) => venue.city))].sort(), ['genova', 'milano']);
  });

  test('busiest first, so the build order matches the value', () => {
    const venues = venuesOf([...many(3, { v: 'Small Hall' }), ...many(7)]);
    assert.deepEqual(venues.map((venue) => venue.count), [7, 3]);
  });
});

describe('eventsOfVenue / feedEvents', () => {
  const corpus = [...many(3), ...many(3, { v: 'Palazzo Ducale' }), ...many(3, { ct: 'milano', rg: 'lombardia' })];

  test('a venue page shows that venue only, in that city only', () => {
    const found = eventsOfVenue(corpus, 'liguria', 'genova', 'teatro-carlo-felice');
    assert.equal(found.length, 3);
    assert.deepEqual([...new Set(found.map((event) => event.v))], ['Teatro Carlo Felice']);
  });

  test('the feed narrows region → city → venue through one function', () => {
    assert.equal(feedEvents(corpus, { region: 'liguria' }).length, 6);
    assert.equal(feedEvents(corpus, { region: 'liguria', city: 'genova' }).length, 6);
    assert.equal(
      feedEvents(corpus, {
        region: 'liguria',
        city: 'genova',
        venue: { slug: 'palazzo-ducale', name: 'Palazzo Ducale' },
      }).length,
      3,
    );
  });

  test('an unknown venue slug shows nothing rather than everything', () => {
    assert.deepEqual(eventsOfVenue(corpus, 'liguria', 'genova', 'nowhere'), []);
  });
});

describe('venuePath', () => {
  test('a venue sits under its city', () => {
    assert.equal(venuePath('liguria', 'genova', 'teatro-carlo-felice'), 'liguria/genova/teatro-carlo-felice/');
  });
});
