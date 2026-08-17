import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { hourLines } from '../src/components/favorites/hour-lines.ts';
import { routeDayHours } from '../src/components/favorites/route-day-hours.ts';
import { axisSpan } from '../src/components/favorites/axis-span.ts';
import { hoursControl } from '../src/components/favorites/hours-control.ts';
import { blockDuration } from '../src/components/favorites/block-duration.ts';
import { blockTitle } from '../src/components/favorites/block-title.ts';
import { offScheduleFlag } from '../src/components/favorites/off-schedule-flag.ts';
import { delButton } from '../src/components/favorites/del-button.ts';
import { timelineBlock } from '../src/components/favorites/timeline-block.ts';
import { travelChip } from '../src/components/favorites/travel-chip.ts';
import { pauseBlock } from '../src/components/favorites/pause-block.ts';
import { addPauseButton } from '../src/components/favorites/add-pause-button.ts';
import { timelineGap } from '../src/components/favorites/timeline-gap.ts';
import { dayGaps } from '../src/components/favorites/day-gaps.ts';
import { renderTimeline } from '../src/components/favorites/render-timeline.ts';
import type { RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';
import type { ScheduledStop } from '../src/lib/favorites/day-schedule.ts';
import type { Payload } from '../src/components/favorites/payload-types.ts';
import type { DayCtx, TimelineOpts } from '../src/components/favorites/timeline-types.ts';

const stop = (o: Partial<RouteStop> & Pick<RouteStop, 'id'>): RouteStop => ({
  t: o.id,
  c: ['other'],
  u: 'https://x',
  s: '2026-07-10',
  ...o,
});

const payload = (o: Partial<Payload> = {}): Payload => ({
  mode: 'walking',
  groups: [],
  durations: {},
  times: {},
  pauses: {},
  pois: {},
  dayStart: '',
  dayEnd: '',
  dayHours: {},
  base: undefined,
  dayBases: {},
  dayFinals: {},
  ...o,
});

const item = (o: Partial<ScheduledStop> & Pick<ScheduledStop, 'id'>): ScheduledStop => ({
  startMin: 540,
  endMin: 630,
  travelMin: 0,
  offSchedule: false,
  ...o,
});

const ctxOf = (o: Partial<TimelineOpts> = {}, start = 540): DayCtx => ({
  opts: { payload: payload(), byId: new Map(), lang: 'en', editable: false, ...o },
  day: '2026-07-10',
  start,
});

const day = (o: Partial<RouteDay> = {}): RouteDay => ({ day: '2026-07-10', stops: [], legs: [], ...o });

describe('hourLines', () => {
  test('one labelled line per whole hour, both ends included', () => {
    const html = hourLines(540, 720);
    assert.equal(html.split('tl-hour').length - 1, 4);
    assert.ok(html.includes('<span>09:00</span>'));
    assert.ok(html.includes('<span>12:00</span>'));
    assert.ok(html.includes('style="top:0px"'));
  });

  test('a zero-length axis still draws its single line', () => {
    assert.equal(hourLines(540, 540).split('tl-hour').length - 1, 1);
  });
});

describe('routeDayHours', () => {
  test('a route that sets both ends carries its own window', () => {
    assert.deepEqual(routeDayHours(payload({ dayStart: '08:00', dayEnd: '20:00' })), {
      start: '08:00',
      end: '20:00',
    });
  });

  test('a half-set or unset window means none', () => {
    assert.equal(routeDayHours(payload()), undefined);
    assert.equal(routeDayHours(payload({ dayStart: '08:00' })), undefined);
    assert.equal(routeDayHours(payload({ dayEnd: '20:00' })), undefined);
  });
});

describe('axisSpan', () => {
  test('an empty day spans from its opening hour', () => {
    assert.deepEqual({ ...axisSpan([], { startMin: 540, endMin: 1320 }) }, { start: 540, end: 1320 });
  });

  test('the axis always reaches the end of the day window', () => {
    const span = axisSpan([item({ id: 'a' })], { startMin: 540, endMin: 1320 });
    assert.equal(span.start, 540);
    assert.equal(span.end, 1320);
  });

  test('a block running past closing time stretches the axis', () => {
    const span = axisSpan([item({ id: 'a', startMin: 1260, endMin: 1400 })], { startMin: 540, endMin: 1320 });
    assert.equal(span.start, 540);
    assert.equal(span.end, 1440);
  });
});

describe('hoursControl', () => {
  test('offers both ends of the day as time inputs', () => {
    const html = hoursControl('2026-07-10', { start: '09:00', end: '22:00' });
    assert.ok(html.includes('data-day-start data-day="2026-07-10" value="09:00"'));
    assert.ok(html.includes('data-day-end data-day="2026-07-10" value="22:00"'));
  });
});

describe('blockDuration', () => {
  const event = stop({ id: 'e1' });

  test('an event block carries its attendance length', () => {
    assert.equal(blockDuration(item({ id: 'e1' }), event, {}), 90);
    assert.equal(blockDuration(item({ id: 'e1' }), event, { e1: 45 }), 45);
  });

  test('a block with no event (a break) is as long as it is drawn', () => {
    assert.equal(blockDuration(item({ id: 'break:e1', startMin: 600, endMin: 660 }), undefined, {}), 60);
  });
});

describe('blockTitle', () => {
  test('the event title, escaped', () => {
    assert.equal(blockTitle(item({ id: 'e1' }), stop({ id: 'e1', t: 'A & B' }), 'en'), 'A &#38; B');
  });

  test('falls back to the id when the stop is not in the corpus', () => {
    assert.equal(blockTitle(item({ id: 'ghost' }), undefined, 'en'), 'ghost');
  });
});

describe('offScheduleFlag', () => {
  const timed = stop({ id: 'e1', h: '18:00' });

  test('nothing while the block sits inside its window', () => {
    assert.equal(offScheduleFlag(item({ id: 'e1' }), timed), '');
  });

  test('shows the real window once the block has drifted out of it', () => {
    const html = offScheduleFlag(item({ id: 'e1', offSchedule: true }), timed);
    assert.ok(html.includes('18:00–19:30'));
    assert.ok(html.includes('aria-label="Runs 18:00–19:30"'));
  });

  test('a stop with no fixed time is never flagged', () => {
    assert.equal(offScheduleFlag(item({ id: 'e1', offSchedule: true }), stop({ id: 'e1' })), '');
    assert.equal(offScheduleFlag(item({ id: 'e1', offSchedule: true }), undefined), '');
  });
});

describe('delButton', () => {
  test('only an editor gets the remove control', () => {
    assert.ok(delButton('e1', true).includes('data-tl-del data-tl-id="e1"'));
    assert.equal(delButton('e1', false), '');
  });
});

describe('timelineBlock', () => {
  test('positions the block and carries the drag data', () => {
    const html = timelineBlock(item({ id: 'e1', startMin: 600, endMin: 690 }), ctxOf({ byId: new Map([['e1', stop({ id: 'e1', t: 'Concert' })]]) }));
    assert.ok(html.includes('data-tl-id="e1"'));
    assert.ok(html.includes('data-tl-day="2026-07-10"'));
    assert.ok(html.includes('data-tl-start="600"'));
    assert.ok(html.includes('data-tl-dur="90"'));
    assert.ok(html.includes('style="top:54px;height:81px"'));
    assert.ok(html.includes('10:00–11:30'));
    assert.ok(html.includes('Concert'));
  });

  test('a very short block still keeps a usable height', () => {
    const html = timelineBlock(item({ id: 'e1', startMin: 540, endMin: 545 }), ctxOf());
    assert.ok(html.includes('height:28px'));
  });

  test('marks a pinned stop and an off-schedule one', () => {
    const pinned = timelineBlock(item({ id: 'e1' }), ctxOf({ payload: payload({ times: { e1: '09:00' } }) }));
    assert.ok(pinned.includes('tl-block--pinned'));
    assert.ok(pinned.includes('📌'));
    assert.ok(timelineBlock(item({ id: 'e1', offSchedule: true }), ctxOf()).includes('tl-block--offschedule'));
  });

  test('the remove control follows the editable flag', () => {
    assert.ok(!timelineBlock(item({ id: 'e1' }), ctxOf()).includes('data-tl-del'));
    assert.ok(timelineBlock(item({ id: 'e1' }), ctxOf({ editable: true })).includes('data-tl-del'));
  });
});

describe('travelChip', () => {
  test('shows the travel time in the gap, in the route mode', () => {
    const html = travelChip(item({ id: 'b', travelMin: 20 }), 600, ctxOf());
    assert.ok(html.includes('🚶 20m'));
    assert.ok(html.includes('style="top:63px"'));
  });

  test('a sub-minute hop is not worth a chip', () => {
    assert.equal(travelChip(item({ id: 'b', travelMin: 0 }), 600, ctxOf()), '');
  });

  test('the glyph follows the mode', () => {
    assert.ok(travelChip(item({ id: 'b', travelMin: 5 }), 600, ctxOf({ payload: payload({ mode: 'driving' }) })).includes('🚗'));
    assert.ok(travelChip(item({ id: 'b', travelMin: 5 }), 600, ctxOf({ payload: payload({ mode: 'transit' }) })).includes('🚌'));
  });
});

describe('pauseBlock', () => {
  test('nothing when no break was inserted', () => {
    assert.equal(pauseBlock('e1', 600, 0, ctxOf()), '');
  });

  test('a break is a draggable block anchored to the stop before it', () => {
    const html = pauseBlock('e1', 600, 60, ctxOf());
    assert.ok(html.includes('data-tl-id="break:e1"'));
    assert.ok(html.includes('data-tl-start="600"'));
    assert.ok(html.includes('data-tl-dur="60"'));
    assert.ok(html.includes('⏸ 1h'));
    assert.ok(!html.includes('data-clear-pause'));
  });

  test('an editor can remove the break', () => {
    assert.ok(pauseBlock('e1', 600, 60, ctxOf({ editable: true })).includes('data-clear-pause data-after="e1"'));
  });
});

describe('addPauseButton', () => {
  test('sits in the gutter at the slot between two blocks', () => {
    const html = addPauseButton('e1', 600, ctxOf());
    assert.ok(html.includes('data-add-pause data-after="e1" data-day="2026-07-10"'));
    assert.ok(html.includes('style="top:54px"'));
  });
});

describe('timelineGap', () => {
  test('carries the travel chip, the break and the add button', () => {
    const html = timelineGap(item({ id: 'b', travelMin: 10 }), 'a', 600, ctxOf({ payload: payload({ pauses: { a: 30 } }) }));
    assert.ok(html.includes('tl-gap'));
    assert.ok(html.includes('break:a'));
    assert.ok(html.includes('tl-add-pause'));
  });
});

describe('dayGaps', () => {
  test('one gap per stop except the first', () => {
    const html = dayGaps(
      day({ stops: [stop({ id: 'a' }), stop({ id: 'b' })] }),
      [item({ id: 'a' }), item({ id: 'b', startMin: 640, endMin: 730, travelMin: 10 })],
      ctxOf(),
    );
    assert.equal(html.split('tl-add-pause').length - 1, 1);
    assert.ok(html.includes('data-after="a"'));
  });

  test('a single-stop day has no gaps', () => {
    assert.equal(dayGaps(day({ stops: [stop({ id: 'a' })] }), [item({ id: 'a' })], ctxOf()), '');
  });
});

describe('renderTimeline', () => {
  test('one axis per day, with the day heading and its hour ruler', () => {
    const html = renderTimeline(
      [day({ stops: [stop({ id: 'a' })] }), day({ day: '2026-07-11', stops: [stop({ id: 'b' })] })],
      payload(),
      new Map([['a', stop({ id: 'a', t: 'Concert' })]]),
      'en',
    );
    assert.equal(html.split('data-tl-axis').length - 1, 2);
    assert.ok(html.includes('tl-day-hours'));
    assert.ok(html.includes('Concert'));
    assert.ok(!html.includes('data-tl-del'));
  });

  test('the editable flag opens the remove controls', () => {
    const html = renderTimeline([day({ stops: [stop({ id: 'a' })] })], payload(), new Map(), 'en', true);
    assert.ok(html.includes('data-tl-del'));
  });

  test('no days, no markup', () => {
    assert.equal(renderTimeline([], payload(), new Map(), 'en'), '');
  });
});
