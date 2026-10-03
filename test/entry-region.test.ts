// The site stopped being a Liguria guide a long time ago: 1 583 events across
// twelve regions, Lombardia first with 536 and Liguria third with 299. The front
// door still sent everybody to Liguria, and so did the bare /calendar, /map, /it
// and /ru. A reader's own region is a fact Cloudflare hands us on every request;
// where the events actually are is a fact in the corpus. Neither needs a
// constant naming the region the site was founded in.
import { describe, expect, test } from 'bun:test';
import { bareEntry } from '../src/lib/i18n/bare-entry.ts';
import { busiestRegion } from '../src/lib/region/busiest-region.ts';
import { entryPath } from '../src/lib/i18n/entry-path.ts';
import { geoRegion } from '../src/lib/region/geo-region.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

describe('geoRegion', () => {
  // Cloudflare names Italy's regions in English: Lombardy, Latium, Apulia.
  test('maps what Cloudflare calls a region to what we call it', () => {
    expect(geoRegion('Lombardy', 'IT')).toBe('lombardia');
    expect(geoRegion('Latium', 'IT')).toBe('lazio');
    expect(geoRegion('Tuscany', 'IT')).toBe('toscana');
    expect(geoRegion('Apulia', 'IT')).toBe('puglia');
    expect(geoRegion('Piedmont', 'IT')).toBe('piemonte');
    expect(geoRegion('Sicily', 'IT')).toBe('sicilia');
    expect(geoRegion('Sardinia', 'IT')).toBe('sardegna');
    expect(geoRegion('Aosta Valley', 'IT')).toBe('valle-d-aosta');
    expect(geoRegion('Trentino-South Tyrol', 'IT')).toBe('trentino-alto-adige');
    expect(geoRegion('Friuli Venezia Giulia', 'IT')).toBe('friuli-venezia-giulia');
    expect(geoRegion('The Marches', 'IT')).toBe('marche');
  });

  test('and takes our own spelling too, in any case', () => {
    expect(geoRegion('Liguria', 'IT')).toBe('liguria');
    expect(geoRegion('emilia-romagna', 'IT')).toBe('emilia-romagna');
    expect(geoRegion('VENETO', 'IT')).toBe('veneto');
  });

  test('a reader outside Italy has no region here, and neither does a blank', () => {
    expect(geoRegion('Bavaria', 'DE')).toBeUndefined();
    expect(geoRegion('Lombardy', 'DE')).toBeUndefined();
    expect(geoRegion(undefined, 'IT')).toBeUndefined();
    expect(geoRegion('Somewhere', 'IT')).toBeUndefined();
  });
});

const event = (region: string, start: string): CompactEvent => ({
  id: `${region}${start}`,
  t: 'Sagra',
  s: start,
  c: ['food'],
  u: 'https://source/1',
  rg: region,
});

describe('busiestRegion', () => {
  const events = [
    event('lombardia', '2026-10-10'),
    event('lombardia', '2026-10-11'),
    event('liguria', '2026-10-12'),
    event('lazio', '2026-09-01'),
    event('lazio', '2026-09-02'),
    event('lazio', '2026-09-03'),
  ];

  test('is the region with the most events still to come, not the most events ever', () => {
    expect(busiestRegion(events, '2026-10-04')).toBe('lombardia');
  });

  test('a corpus with nothing ahead names no region', () => {
    expect(busiestRegion([event('lazio', '2026-09-01')], '2026-10-04')).toBeUndefined();
    expect(busiestRegion([], '2026-10-04')).toBeUndefined();
  });
});

describe('bareEntry', () => {
  test('the front door, with or without a language and a page', () => {
    expect(bareEntry('/')).toEqual({ lang: undefined, page: '' });
    expect(bareEntry('')).toEqual({ lang: undefined, page: '' });
    expect(bareEntry('/calendar')).toEqual({ lang: undefined, page: 'calendar/' });
    expect(bareEntry('/map/')).toEqual({ lang: undefined, page: 'map/' });
    expect(bareEntry('/it')).toEqual({ lang: 'it', page: '' });
    expect(bareEntry('/ru/calendar')).toEqual({ lang: 'ru', page: 'calendar/' });
    expect(bareEntry('/it/map/')).toEqual({ lang: 'it', page: 'map/' });
  });

  test('and nothing else is a front door', () => {
    expect(bareEntry('/liguria/')).toBeUndefined();
    expect(bareEntry('/it/liguria/')).toBeUndefined();
    expect(bareEntry('/submit/')).toBeUndefined();
    expect(bareEntry('/event/x/')).toBeUndefined();
    expect(bareEntry('/calendar/2026-10/')).toBeUndefined();
  });
});

describe('entryPath', () => {
  test('opens the reader region, in the language they asked for', () => {
    expect(entryPath('/', 'ru,en;q=0.8', 'lombardia')).toBe('/ru/lombardia/');
    expect(entryPath('/', undefined, 'lazio')).toBe('/it/lazio/');
    expect(entryPath('/', 'en-GB', 'toscana')).toBe('/toscana/');
  });

  test('keeps the page the address asked for, and the language it already names', () => {
    expect(entryPath('/calendar', 'en-GB', 'toscana')).toBe('/toscana/calendar/');
    expect(entryPath('/it/map', 'en-GB', 'veneto')).toBe('/it/veneto/map/');
    expect(entryPath('/ru', undefined, 'sicilia')).toBe('/ru/sicilia/');
  });

  test('and leaves every other address alone', () => {
    expect(entryPath('/liguria/', undefined, 'liguria')).toBeUndefined();
  });
});
