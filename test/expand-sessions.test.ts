import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { expandSessions } from '../src/lib/events/expand-sessions.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (o: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Umbrella',
  s: '2026-06-12',
  c: ['music'],
  u: 'https://x',
  ...o,
});

const today = '2026-08-13';

describe('expandSessions', () => {
  test('an event without a programme passes through unchanged', () => {
    const e = ev({ id: 'a', s: '2026-08-20' });
    assert.deepEqual(expandSessions([e], today), [e]);
  });

  test("a container's programme becomes one occurrence per UPCOMING session", () => {
    const e = ev({
      id: 'u',
      s: '2026-06-12',
      e: '2026-10-31',
      h: '20:00',
      k: true,
      p: [
        { date: '2026-08-10', time: '21:00', title: 'Concerto A' }, // past → dropped
        { date: '2026-08-14', time: '21:30', title: 'Concerto B' },
        { date: '2026-09-01' }, // no time/title of its own
      ],
    });
    const out = expandSessions([e], today);
    assert.equal(out.length, 2);
    assert.deepEqual(out.map((o) => o.s), ['2026-08-14', '2026-09-01']);
    assert.equal(out[0]?.h, '21:30');
    assert.equal(out[0]?.t, 'Concerto B');
    assert.equal(out[0]?.tl, undefined);
    assert.equal(out[0]?.e, undefined); // a one-day occurrence, not the whole run
    assert.equal(out[0]?.p, undefined); // programme stripped from the occurrence
    assert.equal(out[0]?.k, undefined); // …and so is the container flag
    assert.equal(out[1]?.h, '20:00'); // no session time → the umbrella's time
    assert.equal(out[1]?.t, 'Umbrella'); // no session title → the umbrella's title
  });

  test("a container's run whose sessions are all past falls back to the umbrella", () => {
    const e = ev({ id: 'u', s: '2026-06-12', e: '2026-07-31', k: true, p: [{ date: '2026-07-01' }] });
    assert.deepEqual(expandSessions([e], today), [e]);
  });

  test('a STANDALONE event keeps its run even though it lists a programme', () => {
    // An exhibition open every day that also runs guided tours: expanding it
    // would erase it from every day without a tour.
    const e = ev({
      id: 'x',
      s: '2026-08-01',
      e: '2026-10-31',
      p: [{ date: '2026-08-15', title: 'Guided tour' }],
    });
    assert.deepEqual(expandSessions([e], today), [e]);
  });
});

// A guided visit that leaves at ten, eleven and twenty past two is one thing to
// go to with three times to choose from. Shown as three cards it reads as three
// events, and with the same photograph on each it reads as a broken page.
describe('several sessions of one thing on one day', () => {
  const visit = ev({
    id: 'v',
    s: '2026-10-03',
    e: '2026-10-04',
    h: '10:00',
    k: true,
    p: [
      { date: '2026-10-03', time: '10:00', title: 'Cittadella di Campi' },
      { date: '2026-10-03', time: '14:30', title: 'Cittadella di Campi' },
      { date: '2026-10-04', title: 'Ponte Monumentale' },
      { date: '2026-10-04', time: '14:20', title: 'Ponte Monumentale' },
      { date: '2026-10-04', time: '11:00', title: 'Ponte Monumentale' },
      { date: '2026-10-04', time: '16:00', title: 'Rifugio antiaereo' },
    ],
  });
  const out = expandSessions([visit], '2026-10-01');

  test('become one occurrence per day and title', () => {
    assert.deepEqual(
      out.map((o) => `${o.s} ${o.t}`),
      ['2026-10-03 Cittadella di Campi', '2026-10-04 Ponte Monumentale', '2026-10-04 Rifugio antiaereo'],
    );
  });

  test('carrying every time it starts, in order', () => {
    assert.deepEqual(out[0]?.hs, ['10:00', '14:30']);
    assert.deepEqual(out[1]?.hs, ['11:00', '14:20']);
  });

  test('led by the earliest, which is what the day is sorted by', () => {
    assert.equal(out[0]?.h, '10:00');
    assert.equal(out[1]?.h, '11:00');
  });

  test('a single session carries no list: there is nothing to choose between', () => {
    assert.equal(out[2]?.hs, undefined);
    assert.equal(out[2]?.h, '16:00');
  });

  test('the same title on another day stays its own occurrence', () => {
    const twice = ev({ id: 'w', k: true, p: [{ date: '2026-10-03', time: '10:00', title: 'A' }, { date: '2026-10-04', time: '10:00', title: 'A' }] });
    assert.equal(expandSessions([twice], '2026-10-01').length, 2);
  });

  test('the same hour listed twice is said once', () => {
    const doubled = ev({ id: 'd', k: true, p: [{ date: '2026-10-03', time: '10:00' }, { date: '2026-10-03', time: '10:00' }, { date: '2026-10-03', time: '12:00' }] });
    assert.deepEqual(expandSessions([doubled], '2026-10-01')[0]?.hs, ['10:00', '12:00']);
  });
});
