// Three records in the live corpus on 2026-10-04 were somebody's smoke tests —
// "Evento TEST - World Tour" at venue "TEST STRUTTURA", dated 2028 and 2029 so
// they never expire out of the feed. One of them sits at Gran Teatro GEOX, the
// second-busiest venue on the site, which was just advertised in the sitemap.
import { describe, expect, test } from 'bun:test';
import { withoutTestRecords } from '../src/lib/events/without-test-records.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (t: string, v?: string): CompactEvent => ({
  id: t,
  t,
  s: '2026-10-10',
  c: ['music'],
  u: 'https://source/1',
  v,
  ct: 'milano',
  rg: 'lombardia',
});

describe('withoutTestRecords', () => {
  test('drops what a smoke test leaves behind', () => {
    const kept = withoutTestRecords([
      event('Evento TEST - World Tour', 'TEST STRUTTURA'),
      event('Evento TEST MAPPATO', 'Gran Teatro GEOX'),
      event('Concerto di Natale', 'Teatro Carlo Felice'),
    ]);
    expect(kept.map((e) => e.t)).toEqual(['Concerto di Natale']);
  });

  test('a venue that is itself a test takes its events with it', () => {
    expect(withoutTestRecords([event('Serata', 'Test Struttura 2')])).toEqual([]);
  });

  // The word is ordinary Italian and ordinary English. A filter that reads it
  // anywhere would delete a university admission test and a protest march.
  test('and leaves real events whose words happen to contain it', () => {
    const real = [
      event('Test di ammissione a Medicina', 'Università di Milano'),
      event('Protest Songs: concerto', 'Arci Bellezza'),
      event('Contest di cucina', 'Mercato Centrale'),
    ];
    expect(withoutTestRecords(real)).toHaveLength(3);
  });
});
