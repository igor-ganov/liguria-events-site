// The demand this site gets is poimённый — by name. Two weeks of Search Console:
// "acquario di genova ferragosto", "due forni sestri levante", "caparezza milano
// 2026", at positions 34 to 96. The pages exist; what they do not say in their
// own title is the city and the year the query carries. Meanwhile the category
// pages rank 4th to 6th for queries nobody searches.
import { describe, expect, test } from 'bun:test';
import { eventSeoTitle } from '../src/lib/events/event-seo-title.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent> & Pick<CompactEvent, 't' | 's'>): CompactEvent => ({
  id: 'abc',
  c: ['music'],
  u: 'https://source/1',
  ct: 'milano',
  rg: 'lombardia',
  ...over,
});

describe('eventSeoTitle', () => {
  test('names the city and the year the query carries', () => {
    expect(eventSeoTitle(event({ t: 'Caparezza', s: '2026-10-12' }), 'Caparezza', 'it')).toBe(
      'Caparezza — Milano, 12 ottobre 2026',
    );
  });

  test('in the reader language', () => {
    expect(eventSeoTitle(event({ t: 'Caparezza', s: '2026-10-12' }), 'Caparezza', 'en')).toBe(
      'Caparezza — Milano, 12 October 2026',
    );
  });

  test('a title that already names the city does not say it twice', () => {
    const named = event({ t: 'Caparezza a Milano', s: '2026-10-12' });
    expect(eventSeoTitle(named, 'Caparezza a Milano', 'it')).toBe('Caparezza a Milano — 12 ottobre 2026');
  });

  test('a title that already carries the date keeps it once', () => {
    const named = event({ t: 'Festival 12 ottobre 2026', s: '2026-10-12' });
    expect(eventSeoTitle(named, 'Festival 12 ottobre 2026', 'it')).toBe('Festival 12 ottobre 2026 — Milano');
  });

  test('a run of days names where it starts, not a range nobody searches', () => {
    const run = event({ t: 'Mostra', s: '2026-10-01', e: '2026-12-20' });
    expect(eventSeoTitle(run, 'Mostra', 'it')).toBe('Mostra — Milano, 1 ottobre 2026');
  });

  test('an event with no city is still titled by what it has', () => {
    const noCity = event({ t: 'Sagra', s: '2026-10-12', ct: undefined });
    expect(eventSeoTitle(noCity, 'Sagra', 'it')).toBe('Sagra — 12 ottobre 2026');
  });

  test('and a long title is left alone rather than padded past what a result shows', () => {
    const long = 'Visita alla Collezione di Arte Ambientale e Giardini Storici della Fattoria di Celle';
    expect(eventSeoTitle(event({ t: long, s: '2026-10-12' }), long, 'it')).toBe(long);
  });
});

import { venueJsonLd } from '../src/lib/events/venue-jsonld.ts';
import { venueSeo } from '../src/lib/events/venue-seo.ts';
import { venuesInCity } from '../src/lib/events/venues-in-city.ts';

const SEO = {
  venueTitle: "What's on at {place} in {city}",
  venue: "What's on at {place}, {city} — dates, times and tickets.",
} as const;

describe('venueSeo', () => {
  // "due forni sestri levante" — the query carries the town, the title did not.
  test('names the venue and its town', () => {
    expect(venueSeo(SEO, 'I Due Forni', 'sestri-levante').title).toBe(
      "What's on at I Due Forni in Sestri Levante",
    );
    expect(venueSeo(SEO, 'I Due Forni', 'sestri-levante').description).toBe(
      "What's on at I Due Forni, Sestri Levante — dates, times and tickets.",
    );
  });

  test('a venue whose name already carries the town does not repeat it', () => {
    expect(venueSeo(SEO, 'Teatro Sestri Levante', 'sestri-levante').title).toBe(
      "What's on at Teatro Sestri Levante",
    );
  });
});

describe('venuesInCity', () => {
  const events = [
    event({ t: 'A', s: '2026-10-10', v: 'Teatro Carlo Felice', ct: 'genova', rg: 'liguria' }),
    event({ t: 'B', s: '2026-10-11', v: 'Teatro Carlo Felice', ct: 'genova', rg: 'liguria' }),
    event({ t: 'C', s: '2026-10-12', v: 'Palazzo Ducale', ct: 'genova', rg: 'liguria' }),
    event({ t: 'D', s: '2026-10-13', v: 'Teatro Dal Verme', ct: 'milano', rg: 'lombardia' }),
  ];

  // 17 of 96 event pages sampled are in the index: they are reachable from a
  // feed that scrolls and from a sitemap, and from almost nothing else.
  test('the venues of one city, busiest first, with their paths', () => {
    const found = venuesInCity(events, 'liguria', 'genova');
    expect(found.map((venue) => venue.name)).toEqual(['Teatro Carlo Felice', 'Palazzo Ducale']);
    expect(found[0]?.count).toBe(2);
    expect(found[0]?.path).toBe('liguria/genova/teatro-carlo-felice/');
  });

  test('and nobody else city', () => {
    expect(venuesInCity(events, 'lombardia', 'milano').map((v) => v.name)).toEqual(['Teatro Dal Verme']);
    expect(venuesInCity(events, 'liguria', 'savona')).toEqual([]);
  });
});

describe('venueJsonLd', () => {
  const upcoming = [
    event({ t: 'Concerto', s: '2026-10-10', v: 'Teatro Carlo Felice', ct: 'genova', rg: 'liguria' }),
  ];
  const json = JSON.parse(
    venueJsonLd({
      name: 'Teatro Carlo Felice',
      city: 'genova',
      region: 'liguria',
      url: 'https://dovego.it/it/liguria/genova/teatro-carlo-felice/',
      events: upcoming,
      lang: 'it',
      site: new URL('https://dovego.it'),
    }),
  );

  test('says the page is a place, where it is, and what is on there', () => {
    expect(json['@type']).toBe('Place');
    expect(json.name).toBe('Teatro Carlo Felice');
    expect(json.address.addressLocality).toBe('Genova');
    expect(json.address.addressRegion).toBe('Liguria');
    expect(json.address.addressCountry).toBe('IT');
    expect(json.event).toHaveLength(1);
    expect(json.event[0]['@type']).toBe('Event');
    expect(json.event[0].name).toBe('Concerto');
    expect(json.event[0].url).toContain('/it/event/');
  });

  test('a venue with nothing on is still a place', () => {
    const empty = JSON.parse(
      venueJsonLd({
        name: 'Teatro Chiuso',
        city: 'genova',
        region: 'liguria',
        url: 'https://dovego.it/liguria/genova/teatro-chiuso/',
        events: [],
        lang: 'en',
        site: new URL('https://dovego.it'),
      }),
    );
    expect(empty['@type']).toBe('Place');
    expect(empty.event).toBeUndefined();
  });

  test('and nothing it writes can break out of the script tag', () => {
    const nasty = venueJsonLd({
      name: '</script><script>alert(1)',
      city: 'genova',
      region: 'liguria',
      url: 'https://dovego.it/x/',
      events: [],
      lang: 'en',
      site: new URL('https://dovego.it'),
    });
    expect(nasty).not.toContain('</script>');
  });
});
