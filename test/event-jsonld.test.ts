import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventDateTime } from '../src/lib/seo/event-datetime.ts';
import { eventJsonLd } from '../src/lib/events/event-jsonld.ts';
import { romeOffset } from '../src/lib/seo/rome-offset.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const URL_OF = 'https://dovego.it/event/abc/';

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Concerto',
  s: '2026-08-20',
  c: ['music'],
  u: 'https://source/1',
  ct: 'genova',
  ...over,
});

// The parsed document, read through an index signature — a JSON.parse result is
// `any`, so the member lookups below are typed by this alias, not by a cast.
type LdNode = Record<string, unknown>;
const node = (value: unknown): LdNode => Object(value);
const list = (value: unknown): readonly LdNode[] => Array.from(Object(value));

const ld = (event: CompactEvent, address?: string): LdNode =>
  JSON.parse(
    eventJsonLd({ event, title: 'Concerto', desc: 'A concert.', image: undefined, address, url: URL_OF })
      .replace(/\\u003c/g, '<'),
  );

describe('romeOffset', () => {
  test('summer and winter are not the same offset', () => {
    assert.equal(romeOffset('2026-08-20'), '+02:00');
    assert.equal(romeOffset('2026-01-20'), '+01:00');
  });
});

describe('eventDateTime', () => {
  test('a known start time carries the zone offset with it', () => {
    assert.equal(eventDateTime('2026-08-20', '21:00'), '2026-08-20T21:00:00+02:00');
    assert.equal(eventDateTime('2026-01-20', '21:00'), '2026-01-20T21:00:00+01:00');
  });

  test('no time, no invented one — the bare date is a valid stamp', () => {
    assert.equal(eventDateTime('2026-08-20', undefined), '2026-08-20');
    assert.equal(eventDateTime('2026-08-20', 'evening'), '2026-08-20');
  });
});

describe('eventJsonLd: what Google requires before it will show an event', () => {
  test('name, start, and a location with an address are all present', () => {
    const json = ld(ev({ id: 'abc', v: 'Teatro Carlo Felice' }), 'Passo Eugenio Montale 4');
    assert.equal(json['@type'], 'Event');
    assert.equal(json['name'], 'Concerto');
    assert.equal(json['startDate'], '2026-08-20');
    assert.deepEqual(json['location'], {
      '@type': 'Place',
      name: 'Teatro Carlo Felice',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Passo Eugenio Montale 4',
        addressLocality: 'Genova',
        addressCountry: 'IT',
      },
    });
  });

  test('an event with no venue and no street still has a location — the city', () => {
    // Location is REQUIRED: dropping it, as the previous shape did whenever both
    // were missing, disqualified the event entirely.
    const json = ld(ev({ id: 'abc' }));
    assert.deepEqual(json['location'], {
      '@type': 'Place',
      name: 'Genova',
      address: { '@type': 'PostalAddress', addressLocality: 'Genova', addressCountry: 'IT' },
    });
  });

  test('an address that only repeats the city is not published as a street', () => {
    // Live data: the crawler's address for a Genoa venue was "Genova, GE".
    const json = ld(ev({ id: 'abc' }), 'Genova, GE');
    assert.deepEqual(json['location'], {
      '@type': 'Place',
      name: 'Genova',
      address: { '@type': 'PostalAddress', addressLocality: 'Genova', addressCountry: 'IT' },
    });
    // A real street line survives untouched.
    const real = ld(ev({ id: 'abc' }), 'Via Garibaldi 12, Genova');
    assert.equal(node(node(real['location'])['address'])['streetAddress'], 'Via Garibaldi 12, Genova');
  });

  test('the start time reaches the markup, offset and all', () => {
    assert.equal(ld(ev({ id: 'abc', h: '21:00' }))['startDate'], '2026-08-20T21:00:00+02:00');
  });

  test('status and attendance mode are stated, as the rich result expects', () => {
    const json = ld(ev({ id: 'abc' }));
    assert.equal(json['eventStatus'], 'https://schema.org/EventScheduled');
    assert.equal(json['eventAttendanceMode'], 'https://schema.org/OfflineEventAttendanceMode');
    assert.equal(json['url'], URL_OF);
  });
});

describe('eventJsonLd: offers', () => {
  test('a free event says so, and links to its own page', () => {
    assert.deepEqual(ld(ev({ id: 'abc', f: true }))['offers'], {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: URL_OF,
    });
  });

  test('a paid event points at the vendor when one of its sources is one', () => {
    const paid = ev({ id: 'abc', l: [{ source: 'ticketone', url: 'https://www.ticketone.it/event/x' }] });
    const offers = node(ld(paid)['offers']);
    assert.equal(offers['url'], 'https://www.ticketone.it/event/x');
    assert.equal('price' in offers, false); // a price we never captured is not invented
  });
});

describe('eventJsonLd: containers', () => {
  const festival = ev({
    id: 'abc',
    s: '2026-08-05',
    e: '2026-08-20',
    h: '21:00',
    k: true,
    p: [{ date: '2026-08-05' }, { date: '2026-08-12', time: '19:30', title: 'Serata jazz' }],
  });

  test('each evening is its own sub-event, so a search for one night finds it', () => {
    const subs = list(ld(festival)['subEvent']);
    assert.equal(subs.length, 2);
    assert.equal(subs[0]?.['startDate'], '2026-08-05T21:00:00+02:00'); // falls back to the umbrella's time
    assert.equal(subs[1]?.['startDate'], '2026-08-12T19:30:00+02:00');
    assert.equal(subs[1]?.['name'], 'Serata jazz');
    assert.deepEqual(subs[0]?.['location'], ld(festival)['location']);
  });

  test("the container's own start is its first evening, not the umbrella's hour", () => {
    // Live data: a market whose umbrella said 18:30 while every morning of its
    // programme opens at 08:30.
    const market = ev({
      id: 'abc',
      s: '2026-01-25',
      h: '18:30',
      k: true,
      p: [{ date: '2026-02-22', time: '08:30' }, { date: '2026-01-25', time: '08:30' }],
    });
    assert.equal(ld(market)['startDate'], '2026-01-25T08:30:00+01:00');
  });

  test('a standalone event carries no sub-events at all', () => {
    assert.equal('subEvent' in ld(ev({ id: 'abc' })), false);
    // …nor does an event that lists a programme without being a container.
    assert.equal('subEvent' in ld(ev({ id: 'abc', p: [{ date: '2026-08-05' }] })), false);
  });
});
