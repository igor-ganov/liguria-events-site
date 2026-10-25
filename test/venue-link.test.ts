// The venue name on an event page leads to the venue's own page — when it is a
// venue at all.
import { describe, expect, test } from 'bun:test';
import { venueLink } from '../src/lib/events/venue-link.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const BASE: CompactEvent = { id: 'x', t: 'Evento', s: '2026-10-26', c: ['theatre'], u: 'https://example.test/x', v: 'Teatro della Tosse', ct: 'genova', rg: 'liguria' };

const event = (over: Partial<CompactEvent>): CompactEvent => ({ ...BASE, ...over });

const { v: _venue, ...venueless } = BASE;
const { ct: _town, ...townless } = BASE;

describe('venueLink', () => {
  test('a real venue links to its page in the language of the page', () => {
    expect(venueLink('it')(event({}))).toBe('/it/liguria/genova/teatro-della-tosse/');
    expect(venueLink('ru')(event({}))).toBe('/ru/liguria/genova/teatro-della-tosse/');
  });

  test('"various places", the town itself, no venue or no town link nowhere', () => {
    expect(venueLink('it')(event({ v: 'Luoghi vari' }))).toBeUndefined();
    expect(venueLink('it')(event({ v: 'Genova' }))).toBeUndefined();
    expect(venueLink('it')(venueless)).toBeUndefined();
    expect(venueLink('it')(townless)).toBeUndefined();
  });
});
