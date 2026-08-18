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
