// What a feed page says about itself before the cards start.
//
// Read as plain text — which is how an assistant and a search engine read it —
// a city page began with the navigation and the whole region picker: hundreds
// of place names and counts, and not one sentence saying where the page was
// about or what was in it. Measured on /it/liguria/genova/ 2026-10-05.
import { describe, expect, test } from 'bun:test';
import { feedLead } from '../src/lib/events/feed-lead.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { Ui } from '../src/lib/i18n/ui-schema.ts';

const ui = {
  cat: { music: 'Musica', theatre: 'Teatro', art: 'Mostre', food: 'Cibo', other: 'Varie' },
  monthsIn: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  lead: {
    line: '{place}, {window}: {events} — {cats}.',
    events: { one: '1 evento in programma', other: '{n} eventi in programma' },
    now: 'Oggi: {today}. Questo fine settimana: {weekend}.',
  },
} as unknown as Ui;

// A Monday, so the weekend is the coming Saturday and Sunday.
const TODAY = '2026-10-05';

const event = (id: string, s: string, c: readonly string[], e?: string): CompactEvent =>
  ({ id, t: `Evento ${id}`, s, c, ...(e === undefined ? {} : { e }) }) as unknown as CompactEvent;

const events: readonly CompactEvent[] = [
  event('a', TODAY, ['art']),
  event('b', TODAY, ['art']),
  event('c', '2026-10-10', ['music']),
  event('d', '2026-10-11', ['music']),
  event('e', '2026-10-20', ['art']),
  event('f', '2026-10-15', ['theatre']),
  event('g', '2026-10-18', ['food'], '2026-11-02'),
];

describe('feedLead', () => {
  const line = feedLead({ lang: 'it', ui, placeName: 'Genova', events, today: TODAY });

  test('names the place, the window and how much is in it', () => {
    expect(line).toContain('Genova, 5 ottobre – 2 novembre 2026: 7 eventi in programma');
  });

  test('names what kind of events they are, the commonest first', () => {
    // Three art, two music, one theatre, one food: the three worth naming.
    expect(line).toContain('mostre, musica, teatro.');
    expect(line).not.toContain('cibo');
  });

  test('and says what is on right now, which is the question being asked', () => {
    expect(line).toContain('Oggi: 2.');
    expect(line).toContain('Questo fine settimana: 2.');
  });

  test('one event is one event', () => {
    const single = feedLead({ lang: 'it', ui, placeName: 'Savona', events: [event('z', '2026-10-09', ['music'])], today: TODAY });
    expect(single).toContain('1 evento in programma');
    expect(single).toContain('Savona, 9 ottobre 2026');
  });

  test('nothing on means no sentence: the empty state already says it', () => {
    expect(feedLead({ lang: 'it', ui, placeName: 'Savona', events: [], today: TODAY })).toBe('');
  });

  test('and a week with nothing today or at the weekend does not count to zero out loud', () => {
    const later = [event('y', '2026-10-20', ['music']), event('x', '2026-10-21', ['music'])];
    const quiet = feedLead({ lang: 'it', ui, placeName: 'Savona', events: later, today: TODAY });
    expect(quiet).not.toContain('Oggi');
    expect(quiet).toContain('2 eventi in programma');
  });
});
