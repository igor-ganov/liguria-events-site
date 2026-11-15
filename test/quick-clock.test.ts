// The quick filters against the clock: the moment they are pressed is read in
// Rome whatever zone the browser is in, the weekend rolls over on Friday,
// Saturday and Sunday, late-night use belongs to the new day, and the two
// daylight-saving Sundays are ordinary Sundays. Then the property that ties the
// server to the browser: on the minute the server answers for (0), the cards a
// quick page renders are exactly the cards the browser keeps.
import { afterEach, describe, test, setSystemTime } from 'bun:test';
import assert from 'node:assert/strict';
import { expandSessions } from '../src/lib/events/expand-sessions.ts';
import { feedDayGroups } from '../src/lib/events/feed-day-groups.ts';
import { feedItemAttrs } from '../src/lib/events/feed-item-attrs.ts';
import { matchesQuick } from '../src/lib/quick/matches-quick.ts';
import { quickNarrow } from '../src/lib/quick/quick-narrow.ts';
import { quickWindow } from '../src/lib/quick/quick-window.ts';
import { reachesCutoff } from '../src/lib/quick/reaches-cutoff.ts';
import { romeNow } from '../src/components/feed/rome-now.ts';
import { QUICK_KINDS } from '../src/lib/quick/quick-kind.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ZONE = process.env['TZ'];

afterEach(() => {
  setSystemTime();
  process.env['TZ'] = ZONE;
});

const at = (instant: string, zone: string) => {
  process.env['TZ'] = zone;
  setSystemTime(new Date(instant));
  return romeNow();
};

describe('romeNow reads Rome, whatever zone the browser is in', () => {
  for (const zone of ['UTC', 'America/New_York', 'Asia/Tokyo', 'Europe/Rome']) {
    test(`00:30 on Sunday in Rome is Sunday minute 30 for a browser in ${zone}`, () => {
      assert.deepEqual(at('2026-11-14T23:30:00Z', zone), { day: '2026-11-15', minute: 30 });
    });
    test(`the clocks going back (2026-10-25) count Rome's own hour in ${zone}`, () => {
      assert.deepEqual(at('2026-10-25T00:30:00Z', zone), { day: '2026-10-25', minute: 150 }); // 02:30 CEST
      assert.deepEqual(at('2026-10-25T01:30:00Z', zone), { day: '2026-10-25', minute: 150 }); // 02:30 CET
      assert.deepEqual(at('2026-10-25T17:00:00Z', zone), { day: '2026-10-25', minute: 1080 }); // 18:00 CET
    });
    test(`the clocks going forward (2027-03-28) skip Rome's 02:00 in ${zone}`, () => {
      assert.deepEqual(at('2027-03-28T00:59:00Z', zone), { day: '2027-03-28', minute: 119 });
      assert.deepEqual(at('2027-03-28T01:00:00Z', zone), { day: '2027-03-28', minute: 180 });
      assert.deepEqual(at('2027-03-28T16:00:00Z', zone), { day: '2027-03-28', minute: 1080 });
    });
  }
});

describe('the weekend rolls over', () => {
  const weekend = (day: string, minute: number) => quickWindow('weekend', { day, minute });
  test('Friday 23:59 is still Friday evening to Sunday', () => {
    assert.deepEqual(weekend('2026-11-13', 1439), { from: '2026-11-13', to: '2026-11-15', cutoffs: { '2026-11-13': 1080 }, untimed: true });
  });
  test('Saturday 00:30 is from now to Sunday', () => {
    assert.deepEqual(weekend('2026-11-14', 30), { from: '2026-11-14', to: '2026-11-15', cutoffs: { '2026-11-14': 30 }, untimed: true });
  });
  test('Sunday 00:30 is the rest of Sunday, never next weekend', () => {
    assert.deepEqual(weekend('2026-11-15', 30), { from: '2026-11-15', to: '2026-11-15', cutoffs: { '2026-11-15': 30 }, untimed: true });
  });
  test('Monday 00:30 is the next weekend', () => {
    assert.deepEqual(weekend('2026-11-16', 30).from, '2026-11-20');
  });
  test('the daylight-saving Sundays are Sundays', () => {
    assert.equal(quickWindow('sunday', { day: '2026-10-25', minute: 0 }).from, '2026-10-25');
    assert.equal(quickWindow('sunday', { day: '2026-10-24', minute: 0 }).from, '2026-10-25');
    assert.equal(quickWindow('sunday', { day: '2027-03-28', minute: 0 }).from, '2027-03-28');
    assert.equal(weekend('2027-03-26', 0).to, '2027-03-28');
  });
});

describe('hours on the day', () => {
  test('one of several starts (hs) after the cutoff is enough', () => {
    assert.equal(reachesCutoff({ times: ['10:00', '15:00', '21:00'], du: 0 }, 1080, false), true);
    assert.equal(reachesCutoff({ times: ['10:00', '15:00'], du: 0 }, 1080, false), false);
  });
  test('a show running past midnight is on from its start, and on in the evening', () => {
    assert.equal(reachesCutoff({ times: ['23:00'], du: 180 }, 1080, false), true);
    assert.equal(reachesCutoff({ times: ['16:30'], du: 120 }, 1080, false), true);
    assert.equal(reachesCutoff({ times: ['16:00'], du: 120 }, 1080, false), false);
  });
  test('an event with no hour is out of an evening, in a weekend', () => {
    assert.equal(reachesCutoff({ times: [], du: 0 }, 1080, false), false);
    assert.equal(reachesCutoff({ times: [], du: 0 }, 1080, true), true);
  });
});

// Real-shaped events, many of them: standalone days, long runs, containers with
// sessions, a programme without the container flag, several starts a day.
const HOURS = [undefined, '09:30', '15:30', '17:00', '18:00', '21:00', '23:30'] as const;
const DAYS = ['2026-11-10', '2026-11-13', '2026-11-14', '2026-11-15', '2026-11-17', '2026-11-22'] as const;
const pick = <T,>(list: readonly [T, ...T[]], seed: number): T => list[seed % list.length] ?? list[0];

const corpus: readonly CompactEvent[] = Array.from({ length: 240 }, (_, n): CompactEvent => {
  const base = { id: `e${n}`, t: `E${n}`, c: ['music' as const], u: 'u', s: pick(DAYS, n), du: pick([0, 0, 60, 120, 300] as const, n) };
  const hour = pick(HOURS, n * 7 + 3);
  const sessions = [0, 1, 2].map((k) => {
    const time = pick(HOURS, n + k * 5);
    return { date: pick(DAYS, n + k * 2), ...(time === undefined ? {} : { time }) };
  });
  const shapes: readonly [CompactEvent, ...CompactEvent[]] = [
    { ...base, ...(hour === undefined ? {} : { h: hour }) },
    { ...base, s: '2026-11-01', e: '2026-11-30', ...(hour === undefined ? {} : { h: hour }) },
    { ...base, s: '2026-11-10', e: '2026-11-22', k: true, p: sessions, ...(hour === undefined ? {} : { h: hour }) },
    { ...base, s: '2026-11-10', e: '2026-11-22', p: sessions, ...(hour === undefined ? {} : { h: hour }) },
  ];
  return pick(shapes, n);
});

const browserKeeps = (window: ReturnType<typeof quickWindow>, event: CompactEvent): boolean => {
  const row = feedItemAttrs(event);
  return (
    (row['data-start'] ?? '') <= window.to &&
    (row['data-end'] ?? '') >= window.from &&
    matchesQuick(window, {
      start: row['data-start'] ?? '',
      end: row['data-end'] ?? '',
      times: (row['data-times'] ?? '').split(',').filter((time) => time !== ''),
      du: Number(row['data-du']),
    })
  );
};

const cardKey = (day: string, event: CompactEvent): string => `${event.id}|${event.s}|${event.h ?? ''}|${day}`;

describe('the server and the browser agree card for card', () => {
  for (const kind of QUICK_KINDS) {
    for (const today of ['2026-11-09', '2026-11-13', '2026-11-14', '2026-11-15']) {
      test(`${kind} asked on ${today}`, () => {
        const window = quickWindow(kind, { day: today, minute: 0 });
        const server = feedDayGroups(today)(quickNarrow(kind)(corpus, today)).flatMap(([day, list]) => list.map((event) => cardKey(day, event)));
        const whole = feedDayGroups(today)(expandSessions(corpus, today));
        const browser = whole.flatMap(([day, list]) => list.filter((event) => browserKeeps(window, event)).map((event) => cardKey(day, event)));
        assert.deepEqual(server.toSorted(), browser.toSorted());
      });
    }
  }
});
