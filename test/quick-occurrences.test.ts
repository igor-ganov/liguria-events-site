// What a quick page (tonight, this weekend, Sunday evening) and a dated facet
// (today, tomorrow) list on the server, checked occurrence by occurrence: a
// container is judged by the session that falls inside the window — its day
// AND its own hour — never by the umbrella's run or the umbrella's hour, and
// the page then shows only that session, not every upcoming night of the run.
// Events are shaped like the live corpus (2026-11-15 is a Sunday).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { facetOf } from '../src/lib/events/facet-of.ts';
import { feedDayGroups } from '../src/lib/events/feed-day-groups.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SUN = '2026-11-15';

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: `Event ${over.id}`,
  s: SUN,
  c: ['music'],
  u: 'https://example.org/e',
  rg: 'liguria',
  ct: 'genova',
  ...over,
});

// "Mostra della Zucca": the umbrella says 18:00, every morning says 10:00.
const zucca = ev({
  id: 'zucca',
  s: '2026-11-07',
  e: SUN,
  h: '18:00',
  k: true,
  p: [
    { date: '2026-11-07', time: '10:30' },
    { date: '2026-11-08', time: '10:00' },
    { date: '2026-11-14', time: '10:00' },
    { date: SUN, time: '10:00' },
  ],
});

// "Candlelight": three nights months apart, the first one tonight.
const candlelight = ev({
  id: 'candle',
  e: '2027-03-12',
  h: '19:30',
  du: 60,
  k: true,
  p: [
    { date: SUN, time: '19:30' },
    { date: '2027-01-10', time: '19:30' },
    { date: '2027-03-12', time: '21:30' },
  ],
});

// A weekly reading group on Tuesdays only, whose run spans many Sundays.
const tuesdays = ev({
  id: 'tuesdays',
  s: '2026-11-10',
  e: '2026-12-29',
  h: '18:00',
  k: true,
  p: ['2026-11-10', '2026-11-17', '2026-11-24'].map((date) => ({ date, time: '18:00' })),
});

// A Sunday session at 18:00 under an umbrella that states no hour at all.
const sundaySix = ev({
  id: 'sunday-six',
  s: '2026-11-10',
  e: '2026-11-24',
  k: true,
  p: [
    { date: '2026-11-10', time: '10:00' },
    { date: SUN, time: '18:00' },
  ],
});

const narrow = (slug: string, events: readonly CompactEvent[], today: string): readonly CompactEvent[] =>
  facetOf(slug)?.narrow(events, today) ?? [];

const ids = (events: readonly CompactEvent[]): readonly string[] => events.map((event) => event.id).toSorted();

const days = (slug: string, events: readonly CompactEvent[], today: string): readonly string[] =>
  feedDayGroups(today)(narrow(slug, events, today)).flatMap(([day, list]) => list.map((event) => `${event.id}@${day} ${event.h ?? ''}`));

describe('Sunday evening, on the server', () => {
  test('a container whose Sunday session is in the morning is not on Sunday evening, whatever the umbrella hour', () => {
    assert.deepEqual(ids(narrow('sunday-evening', [zucca], SUN)), []);
  });

  test('a container with a Sunday 18:00 session is on Sunday evening, though the umbrella states no hour', () => {
    assert.deepEqual(ids(narrow('sunday-evening', [sundaySix], SUN)), ['sunday-six']);
  });

  test('a container whose sessions are all on Tuesdays is not on Sunday evening', () => {
    assert.deepEqual(ids(narrow('sunday-evening', [tuesdays], SUN)), []);
  });

  test('the page shows the Sunday night of a long run, and none of its later nights', () => {
    assert.deepEqual(days('sunday-evening', [candlelight], SUN), ['candle@2026-11-15 19:30']);
  });

  test('…and the Sunday 18:00 session of a container, not its Tuesday morning', () => {
    assert.deepEqual(days('sunday-evening', [sundaySix], '2026-11-09'), ['sunday-six@2026-11-15 18:00']);
  });
});

describe('the other dated pages, on the server', () => {
  test('tonight shows tonight only, not the run of nights after it', () => {
    assert.deepEqual(days('tonight', [candlelight], SUN), ['candle@2026-11-15 19:30']);
  });

  test('today shows today only', () => {
    assert.deepEqual(days('today', [candlelight, zucca], SUN), ['zucca@2026-11-15 10:00', 'candle@2026-11-15 19:30']);
  });

  test('tomorrow shows tomorrow only', () => {
    assert.deepEqual(days('tomorrow', [tuesdays], '2026-11-16'), ['tuesdays@2026-11-17 18:00']);
  });

  test('this weekend, asked on a Friday, keeps the weekend sessions and drops the Tuesday ones', () => {
    assert.deepEqual(days('this-weekend', [sundaySix, tuesdays], '2026-11-13'), ['sunday-six@2026-11-15 18:00']);
  });

  test('a standalone event that lists a programme (p without k) is judged by its run and its own hour', () => {
    const open = ev({ id: 'open', s: '2026-11-01', e: '2026-11-30', h: '19:00', p: [{ date: '2026-11-17', time: '11:00' }] });
    assert.deepEqual(ids(narrow('sunday-evening', [open], SUN)), ['open']);
    assert.deepEqual(days('sunday-evening', [open], SUN), ['open@2026-11-15 19:00']);
  });
});
