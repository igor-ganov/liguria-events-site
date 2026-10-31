// Tonight, this weekend, Sunday evening: which days and hours each one means
// at the moment it is pressed (Europe/Rome), and which cards survive it.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { shiftDay } from '../src/lib/calendar/shift-day.ts';
import { daysBetween } from '../src/lib/calendar/days-between.ts';
import { quickWindow } from '../src/lib/quick/quick-window.ts';
import { quickKindOf } from '../src/lib/quick/quick-kind-of.ts';
import { reachesCutoff } from '../src/lib/quick/reaches-cutoff.ts';
import { matchesQuick } from '../src/lib/quick/matches-quick.ts';
import type { QuickTiming } from '../src/lib/quick/matches-quick.ts';

// 2026-10-31 is a Saturday.
const SAT = '2026-10-31';
const SUN = '2026-11-01';
const MON = '2026-11-02';
const WED = '2026-11-04';
const FRI = '2026-11-06';
const NOON = 720;

const timing = (over: Partial<QuickTiming> = {}): QuickTiming => ({
  start: WED,
  end: WED,
  times: [],
  du: 0,
  ...over,
});

describe('calendar steps', () => {
  test('shiftDay crosses months and goes back', () => {
    assert.equal(shiftDay(SAT, 1), SUN);
    assert.equal(shiftDay(SUN, -1), SAT);
    assert.equal(shiftDay('2026-12-31', 1), '2027-01-01');
  });
  test('daysBetween is inclusive', () => {
    assert.deepEqual(daysBetween(FRI, '2026-11-08'), [FRI, '2026-11-07', '2026-11-08']);
    assert.deepEqual(daysBetween(WED, WED), [WED]);
  });
});

describe('quickKindOf', () => {
  test('reads only the three it knows', () => {
    assert.equal(quickKindOf('tonight'), 'tonight');
    assert.equal(quickKindOf('weekend'), 'weekend');
    assert.equal(quickKindOf('sunday'), 'sunday');
    assert.equal(quickKindOf('constructor'), '');
    assert.equal(quickKindOf(undefined), '');
  });
});

describe('quickWindow', () => {
  test('tonight is today from 18:00, untimed events excluded', () => {
    assert.deepEqual(quickWindow('tonight', { day: WED, minute: NOON }), {
      from: WED,
      to: WED,
      cutoffs: { [WED]: 1080 },
      untimed: false,
    });
  });
  test('midweek, the weekend is Friday from 18:00 to Sunday', () => {
    const friday = { from: FRI, to: '2026-11-08', cutoffs: { [FRI]: 1080 }, untimed: true };
    assert.deepEqual(quickWindow('weekend', { day: MON, minute: NOON }), friday);
    assert.deepEqual(quickWindow('weekend', { day: WED, minute: NOON }), friday);
    assert.deepEqual(quickWindow('weekend', { day: FRI, minute: 1300 }), friday);
  });
  test('on Saturday it runs from now to Sunday', () => {
    assert.deepEqual(quickWindow('weekend', { day: SAT, minute: 930 }), {
      from: SAT,
      to: SUN,
      cutoffs: { [SAT]: 930 },
      untimed: true,
    });
  });
  test('on Sunday it is the rest of Sunday', () => {
    assert.deepEqual(quickWindow('weekend', { day: SUN, minute: 600 }), {
      from: SUN,
      to: SUN,
      cutoffs: { [SUN]: 600 },
      untimed: true,
    });
  });
  test('Sunday evening is the coming Sunday from 17:00, today when it is Sunday', () => {
    const sunday = (day: string): string => quickWindow('sunday', { day, minute: NOON }).from;
    assert.equal(sunday(WED), '2026-11-08');
    assert.equal(sunday(SAT), SUN);
    assert.equal(sunday(SUN), SUN);
    assert.deepEqual(quickWindow('sunday', { day: WED, minute: NOON }).cutoffs, { '2026-11-08': 1020 });
    assert.equal(quickWindow('sunday', { day: WED, minute: NOON }).untimed, false);
  });
});

describe('reachesCutoff', () => {
  test('a start at or after the cutoff counts', () => {
    assert.equal(reachesCutoff(timing({ times: ['20:30'] }), 1080, false), true);
    assert.equal(reachesCutoff(timing({ times: ['18:00'] }), 1080, false), true);
    assert.equal(reachesCutoff(timing({ times: ['10:00'] }), 1080, false), false);
  });
  test('a multi-time event with any evening time counts', () => {
    assert.equal(reachesCutoff(timing({ times: ['10:00', '21:00'] }), 1080, false), true);
  });
  test('an event that runs into the evening counts, one that ends at it does not', () => {
    assert.equal(reachesCutoff(timing({ times: ['10:00'], du: 600 }), 1080, false), true);
    assert.equal(reachesCutoff(timing({ times: ['10:00'], du: 480 }), 1080, false), false);
  });
  test('untimed events follow the filter, unless they run all day', () => {
    assert.equal(reachesCutoff(timing(), 1080, false), false);
    assert.equal(reachesCutoff(timing(), 1080, true), true);
    assert.equal(reachesCutoff(timing({ du: 1440 }), 1080, false), true);
  });
});

describe('matchesQuick', () => {
  const weekend = quickWindow('weekend', { day: WED, minute: NOON });
  const tonight = quickWindow('tonight', { day: WED, minute: NOON });
  test('Friday needs the evening, Saturday and Sunday need nothing', () => {
    assert.equal(matchesQuick(weekend, timing({ start: FRI, end: FRI, times: ['19:00'] })), true);
    assert.equal(matchesQuick(weekend, timing({ start: FRI, end: FRI, times: ['10:00'] })), false);
    assert.equal(matchesQuick(weekend, timing({ start: '2026-11-07', end: '2026-11-07', times: ['10:00'] })), true);
    assert.equal(matchesQuick(weekend, timing({ start: '2026-11-07', end: '2026-11-07' })), true);
  });
  test('a run counts by the days it shares with the window', () => {
    assert.equal(matchesQuick(weekend, timing({ start: SUN, end: '2026-11-30', times: ['10:00'] })), true);
    assert.equal(matchesQuick(weekend, timing({ start: SUN, end: FRI, times: ['10:00'] })), false);
    assert.equal(matchesQuick(weekend, timing({ start: SUN, end: FRI })), true);
  });
  test('outside the days, never', () => {
    assert.equal(matchesQuick(weekend, timing({ times: ['20:00'] })), false);
    assert.equal(matchesQuick(tonight, timing({ start: FRI, end: FRI, times: ['20:00'] })), false);
  });
  test('tonight takes an evening run but not an untimed one', () => {
    assert.equal(matchesQuick(tonight, timing({ start: '2026-10-20', end: '2026-11-30', times: ['21:00'] })), true);
    assert.equal(matchesQuick(tonight, timing()), false);
  });
});
