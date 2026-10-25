// A reader at one show of a theatre wants its other shows, and the town strip
// mixed them into a list of everything nearby, if it showed them at all.
import { describe, expect, test } from 'bun:test';
import { alsoAtVenue } from '../src/lib/events/also-at-venue.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const TODAY = '2026-10-25';

const BASE: CompactEvent = { id: 'x', t: 'Spettacolo', s: TODAY, c: ['theatre'], u: 'https://example.test/x', v: 'Teatro della Tosse', ct: 'genova', rg: 'liguria' };

const event = (over: Partial<CompactEvent>): CompactEvent => ({ ...BASE, ...over });

const here = event({ id: 'self', t: 'A cena con Macbeth', s: '2026-10-15', e: '2026-10-25' });

const corpus: readonly CompactEvent[] = [
  here,
  event({ id: 'dido', t: 'Dido and Aeneas', s: '2026-10-31', e: '2026-11-01' }),
  event({ id: 'baccini', t: 'Francesco Baccini in concerto', s: '2026-10-29' }),
  // Another spelling of the same theatre is the same theatre.
  event({ id: 'spelled', t: 'Il donatore', s: '2026-11-03', v: 'teatro della  Tosse' }),
  // A season that started long ago is on now, so it comes before next week.
  event({ id: 'season', t: 'ReC 26', s: '2026-02-06', e: '2026-12-31' }),
  event({ id: 'other-venue', t: 'Altro teatro', s: '2026-10-26', v: 'Teatro Carlo Felice' }),
  event({ id: 'other-town', t: 'Omonimo', s: '2026-10-26', ct: 'savona' }),
  event({ id: 'over', t: 'Finito', s: '2026-10-01', e: '2026-10-02' }),
  event({ id: 'edition', t: 'A cena con Macbeth 2027', s: '2027-10-15' }),
];

describe('alsoAtVenue', () => {
  const found = alsoAtVenue(corpus, here, TODAY);

  test('is the other upcoming shows of this venue, soonest first', () => {
    expect(found.shown.map((one) => one.id)).toEqual(['season', 'baccini', 'dido', 'spelled']);
  });

  test('never this event, another year of it, another venue, town, or what is over', () => {
    const ids = found.shown.map((one) => one.id);
    ['self', 'edition', 'other-venue', 'other-town', 'over'].forEach((id) => expect(ids).not.toContain(id));
  });

  test('shows the eight soonest when the venue is busier; its page has the rest', () => {
    const busy = Array.from({ length: 11 }, (_, index) => event({ id: `b${index}`, t: `Show ${index}`, s: `2026-11-${String(index + 10)}` }));
    const many = alsoAtVenue([here, ...busy], here, TODAY);
    expect(many.shown.map((one) => one.id)).toEqual(['b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']);
  });

  test('a venue that is not a place offers nothing', () => {
    const vague = event({ id: 'vague', v: 'Luoghi vari' });
    expect(alsoAtVenue([vague, event({ id: 'v2', t: 'Altro', v: 'Luoghi vari' })], vague, TODAY).shown).toEqual([]);
  });

  test('nor does an event with no venue or no town', () => {
    const { v: _venue, ...bare } = event({ id: 'bare' });
    const { ct: _town, ...townless } = event({ id: 'townless' });
    expect(alsoAtVenue([bare, { ...bare, id: 'b2', t: 'Altro' }], bare, TODAY).shown).toEqual([]);
    expect(alsoAtVenue([townless, { ...townless, id: 't2', t: 'Altro' }], townless, TODAY).shown).toEqual([]);
  });
});
