// What is left of the front door once it stopped guessing. bareEntry still says
// which addresses are doors — it is how the one remaining redirect, to the
// language the reader's browser asked for, finds them. geoRegion and
// busiestRegion decide no door at all now: they survive as the fallback for a
// push subscription on /notifications/, a page that asks the reader for their
// location first and needs something to answer a refusal with.
//
// Nothing in this file decides where a reader lands. See entry-landing.test.ts.
import { describe, expect, test } from 'bun:test';
import { bareEntry } from '../src/lib/i18n/bare-entry.ts';
import { busiestRegion } from '../src/lib/region/busiest-region.ts';
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

