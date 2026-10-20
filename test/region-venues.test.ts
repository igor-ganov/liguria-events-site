// The venue pages are advertised and never fetched: 0 of 12 sampled indexed,
// every day for a month. The link that was supposed to reach them comes from
// the city page — and the city pages are the weak tier themselves
// (/it/piemonte/torino/ crawled once and not indexed, /it/lombardia/milano/
// unknown to Google). A venue page was therefore two hops from anything Google
// reads often, through a hop it barely reads. The region feed is the tier it
// does keep, so the links start there.
import { describe, expect, test } from 'bun:test';
import { feedExtras } from '../src/lib/events/feed-extras.ts';
import { PROGRAMME_MIN } from '../src/lib/seo/programme-min.ts';
import { venuesHeading } from '../src/lib/events/venues-heading.ts';
import { venuesInRegion } from '../src/lib/events/venues-in-region.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const at = (venue: string, city: string, start: string): CompactEvent => ({
  id: `${venue}${start}`,
  t: 'Concerto',
  s: start,
  c: ['music'],
  u: 'https://source/1',
  v: venue,
  ct: city,
  rg: 'liguria',
});

const events = [
  at('Teatro Carlo Felice', 'genova', '2026-10-10'),
  at('Teatro Carlo Felice', 'genova', '2026-10-11'),
  at('Teatro Carlo Felice', 'genova', '2026-10-12'),
  at('Teatro Chiabrera', 'savona', '2026-10-10'),
  at('Teatro Chiabrera', 'savona', '2026-10-11'),
  at('Teatro Chiabrera', 'savona', '2026-10-12'),
  at('Teatro Chiabrera', 'savona', '2026-10-13'),
  at('Bar Sotto Casa', 'genova', '2026-10-10'),
];

describe('venuesInRegion', () => {
  test('the venues of the region with a programme, busiest first, each with its town', () => {
    const found = venuesInRegion(events, 'liguria');
    expect(found.map((venue) => venue.name)).toEqual(['Teatro Chiabrera', 'Teatro Carlo Felice']);
    expect(found[0]?.town).toBe('Savona');
    expect(found[0]?.path).toBe('liguria/savona/teatro-chiabrera/');
  });

  test('exactly the set the sitemap advertises, so a crawler is offered no address it was not also given a path to', () => {
    expect(PROGRAMME_MIN).toBe(3);
    expect(venuesInRegion(events, 'liguria').every((venue) => venue.count >= PROGRAMME_MIN)).toBe(true);
    expect(venuesInRegion(events, 'liguria').some((venue) => venue.name === 'Bar Sotto Casa')).toBe(false);
  });

  test('and nothing from another region', () => {
    expect(venuesInRegion(events, 'lombardia')).toEqual([]);
  });
});

describe('feedExtras', () => {
  const extras = (scope: Parameters<typeof feedExtras>[0]['scope']) =>
    feedExtras({ lang: 'it', scope, corpus: events, shown: events, path: 'liguria/', site: new URL('https://dovego.it') });

  test('a region feed carries the links to its venues', () => {
    expect(extras({ region: 'liguria' }).cityVenues.map((venue) => venue.name)).toEqual([
      'Teatro Chiabrera',
      'Teatro Carlo Felice',
    ]);
  });

  test('a city feed still carries every venue in town, programme or not', () => {
    const inCity = extras({ region: 'liguria', city: 'genova' }).cityVenues;
    expect(inCity.map((venue) => venue.name)).toEqual(['Teatro Carlo Felice', 'Bar Sotto Casa']);
    // In town there is no need to name the town.
    expect(inCity[0]?.town).toBeUndefined();
  });

  test('a venue page does not list itself, and a facet is a narrowing, not a directory', () => {
    expect(extras({ region: 'liguria', city: 'genova', venue: { slug: 'teatro-carlo-felice', name: 'Teatro Carlo Felice' } }).cityVenues).toEqual([]);
    expect(extras({ region: 'liguria', facet: { slug: 'music', narrow: (list) => list } }).cityVenues).toEqual([]);
  });
});

describe('venuesHeading', () => {
  const text = { venuesHere: 'Luoghi a {place}', venuesAround: 'Luoghi in {place}' };

  test('in a town, and across a region, because the preposition declines', () => {
    expect(venuesHeading(text, 'genova', 'Genova')).toBe('Luoghi a Genova');
    expect(venuesHeading(text, undefined, 'Liguria')).toBe('Luoghi in Liguria');
  });
});
