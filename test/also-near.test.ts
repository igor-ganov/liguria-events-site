// Where a reader goes when the page they came for is read.
//
// An event page offered one way onward — "all events in Liguria" — plus other
// years of the same event, and nothing else: not its own venue, not its own
// town, not the concert on the next street that night. For a crawler that is
// the same gap: of 96 event pages sampled in a week, 17 were in the index,
// because the only path to one is scrolling a feed.
import { describe, expect, test } from 'bun:test';
import { alsoNear } from '../src/lib/events/also-near.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const TODAY = '2026-10-05';

const event = (over: Partial<CompactEvent>): CompactEvent =>
  ({ id: 'x', t: 'Evento', s: TODAY, c: ['music'], u: 'https://example.test/x', ct: 'genova', rg: 'liguria', ...over }) as CompactEvent;

const here = event({ id: 'self', t: 'Concerto di stasera', s: '2026-10-08' });

const corpus: readonly CompactEvent[] = [
  here,
  event({ id: 'same-night', t: 'Mostra della stessa sera', s: '2026-10-08' }),
  event({ id: 'next-day', t: 'Teatro il giorno dopo', s: '2026-10-09' }),
  event({ id: 'far-off', t: 'Sagra fra tre settimane', s: '2026-10-29' }),
  event({ id: 'other-town', t: 'Altro in un'.concat(' altra città'), s: '2026-10-08', ct: 'milano', rg: 'lombardia' }),
  event({ id: 'over', t: 'Finito ieri', s: '2026-10-04', e: '2026-10-04' }),
  // The same feast in another year: the editions block says so already.
  event({ id: 'edition', t: 'Concerto di stasera 2027', s: '2027-10-08' }),
];

describe('alsoNear', () => {
  const found = alsoNear(corpus, here, TODAY);

  test('is this town, around this date, nearest first', () => {
    expect(found.map((one) => one.id).slice(0, 3)).toEqual(['same-night', 'next-day', 'far-off']);
  });

  test('never the event the reader is already reading', () => {
    expect(found.some((one) => one.id === 'self')).toBe(false);
  });

  test('nor another year of it, which the editions block already offers', () => {
    expect(found.some((one) => one.id === 'edition')).toBe(false);
  });

  test('nor another town, which is not "nearby" in any useful sense', () => {
    expect(found.some((one) => one.id === 'other-town')).toBe(false);
  });

  test('nor anything already over', () => {
    expect(found.some((one) => one.id === 'over')).toBe(false);
  });

  test('a town with nothing else on offers nothing rather than something far away', () => {
    const alone = alsoNear([here], here, TODAY);
    expect(alone).toEqual([]);
  });

  test('an event with no town falls back to its region', () => {
    const regional = event({ id: 'regional', t: 'Senza città', s: '2026-10-08', ct: undefined });
    const found = alsoNear([regional, event({ id: 'in-region', s: '2026-10-08' })], regional, TODAY);
    expect(found.map((one) => one.id)).toEqual(['in-region']);
  });
});
