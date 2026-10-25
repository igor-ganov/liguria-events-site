// The two strips under an event: its venue's other shows, then the town's.
// A show already offered as "at this venue" must not come back as "in town".
import { describe, expect, test } from 'bun:test';
import { alsoAround } from '../src/lib/events/also-around.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const TODAY = '2026-10-25';

const BASE: CompactEvent = { id: 'x', t: 'Evento', s: '2026-10-26', c: ['theatre'], u: 'https://example.test/x', v: 'Teatro della Tosse', ct: 'genova', rg: 'liguria' };

const event = (over: Partial<CompactEvent>): CompactEvent => ({ ...BASE, ...over });

const here = event({ id: 'self', t: 'A cena con Macbeth' });

const corpus: readonly CompactEvent[] = [
  here,
  event({ id: 'dido', t: 'Dido and Aeneas' }),
  event({ id: 'concert', t: 'Concerto in piazza', v: 'Piazza De Ferrari' }),
];

describe('alsoAround', () => {
  const around = alsoAround(corpus, here, TODAY);

  test('the venue strip holds the venue’s other shows', () => {
    expect(around.venue.shown.map((one) => one.id)).toEqual(['dido']);
  });

  test('the town strip does not repeat them', () => {
    expect(around.town.map((one) => one.id)).toEqual(['concert']);
  });

  test('with no real venue the town strip keeps everything', () => {
    const vague = event({ id: 'vague', t: 'Festa', v: 'Luoghi vari' });
    const loose = alsoAround([vague, ...corpus], vague, TODAY);
    expect(loose.venue.shown).toEqual([]);
    expect(loose.town.map((one) => one.id).toSorted()).toEqual(['concert', 'dido', 'self']);
  });
});
