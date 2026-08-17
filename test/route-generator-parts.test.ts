import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { addPause } from '../src/components/favorites/add-pause.ts';
import { asArray } from '../src/components/favorites/as-array.ts';
import { asIdList } from '../src/components/favorites/as-id-list.ts';
import { asIdLists } from '../src/components/favorites/as-id-lists.ts';
import { asNumberMap } from '../src/components/favorites/as-number-map.ts';
import { asSavedRoute } from '../src/components/favorites/as-saved-route.ts';
import { asStringMap } from '../src/components/favorites/as-string-map.ts';
import { breakAnchorAt } from '../src/components/favorites/break-anchor-at.ts';
import { commitTarget } from '../src/components/favorites/commit-target.ts';
import { dateRange } from '../src/components/favorites/date-range.ts';
import { dayWindow } from '../src/components/favorites/day-window.ts';
import { escHtml } from '../src/components/favorites/esc-html.ts';
import { fieldOf } from '../src/components/favorites/field-of.ts';
import { flattenCommit } from '../src/components/favorites/flatten-commit.ts';
import { flowStartMin } from '../src/components/favorites/flow-start-min.ts';
import { genPayload } from '../src/components/favorites/gen-payload.ts';
import { groupsInOrder } from '../src/components/favorites/groups-in-order.ts';
import { isRecord } from '../src/components/favorites/is-record.ts';
import { makeCommitRouter } from '../src/components/favorites/make-commit-router.ts';
import { movePause } from '../src/components/favorites/move-pause.ts';
import { nextDayHours } from '../src/components/favorites/next-day-hours.ts';
import { nextRememberedRoutes } from '../src/components/favorites/next-remembered-routes.ts';
import { omitKey } from '../src/components/favorites/omit-key.ts';
import { pickDurations } from '../src/components/favorites/pick-durations.ts';
import { pickPois } from '../src/components/favorites/pick-pois.ts';
import { routeSaveName } from '../src/components/favorites/route-save-name.ts';
import { routeSpanHtml } from '../src/components/favorites/route-span-html.ts';
import { savedRouteBody } from '../src/components/favorites/saved-route-body.ts';
import { shareLinkHtml } from '../src/components/favorites/share-link-html.ts';
import { sortByOrder } from '../src/components/favorites/sort-by-order.ts';
import { stealDurations } from '../src/components/favorites/steal-durations.ts';
import { stopsOfDay } from '../src/components/favorites/stops-of-day.ts';
import { stopsOfGroups } from '../src/components/favorites/stops-of-groups.ts';
import { timesAfterMove } from '../src/components/favorites/times-after-move.ts';
import { toMode } from '../src/components/favorites/to-mode.ts';
import { toView } from '../src/components/favorites/to-view.ts';
import { viewToggleHtml } from '../src/components/favorites/view-toggle-html.ts';
import type { RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';
import type { ScheduledStop } from '../src/lib/favorites/day-schedule.ts';

const stop = (o: Partial<RouteStop> & Pick<RouteStop, 'id' | 's'>): RouteStop => ({
  t: o.id,
  c: ['other'], // default attendance: 90 minutes
  u: 'https://x',
  ...o,
});

const day = (name: string, ids: readonly string[]): RouteDay => ({
  day: name,
  stops: ids.map((id) => stop({ id, s: name })),
  legs: [],
});

const scheduled = (id: string, startMin: number): ScheduledStop => ({
  id,
  startMin,
  endMin: startMin + 90,
  travelMin: 0,
  offSchedule: false,
});

describe('escHtml', () => {
  test('escapes the four markup-significant characters as numeric entities', () => {
    assert.equal(escHtml('<a href="x">&'), '&#60;a href=&#34;x&#34;&#62;&#38;');
  });

  test('leaves ordinary text, including accents and emoji, alone', () => {
    assert.equal(escHtml('Genovaà 🏠'), 'Genovaà 🏠');
  });
});

describe('isRecord / fieldOf / asArray', () => {
  test('objects and arrays are records, primitives are not', () => {
    assert.equal(isRecord({}), true);
    assert.equal(isRecord([]), true);
    assert.equal(isRecord('x'), false);
    assert.equal(isRecord(undefined), false);
    assert.equal(isRecord(0), false);
  });

  test('fieldOf reads a property, or undefined off anything else', () => {
    assert.equal(fieldOf({ id: 'r1' }, 'id'), 'r1');
    assert.equal(fieldOf({ id: 'r1' }, 'url'), undefined);
    assert.equal(fieldOf('r1', 'id'), undefined);
    assert.equal(fieldOf(undefined, 'id'), undefined);
  });

  test('asArray keeps a list and flattens anything else to empty', () => {
    assert.deepEqual(asArray([1, 'a']), [1, 'a']);
    assert.deepEqual(asArray({ 0: 'a' }), []);
    assert.deepEqual(asArray(undefined), []);
  });
});

describe('stored-map readers', () => {
  test('asNumberMap keeps only numeric values', () => {
    assert.deepEqual(asNumberMap({ a: 90, b: '90', c: undefined, d: 0 }), { a: 90, d: 0 });
  });

  test('asStringMap keeps only string values', () => {
    assert.deepEqual(asStringMap({ a: '10:00', b: 600 }), { a: '10:00' });
  });

  test('a corrupted or absent store reads as an empty map', () => {
    assert.deepEqual(asNumberMap(0), {});
    assert.deepEqual(asStringMap(undefined), {});
    assert.deepEqual(asIdLists('nonsense'), {});
  });

  test('asIdList drops everything that is not a string', () => {
    assert.deepEqual(asIdList(['a', 1, undefined, 'b']), ['a', 'b']);
    assert.deepEqual(asIdList({ a: 1 }), []);
  });

  test('asIdLists keeps day → ids, dropping days whose value is not a list', () => {
    assert.deepEqual(asIdLists({ '2026-07-10': ['a', 2, 'b'], '2026-07-11': 'x' }), {
      '2026-07-10': ['a', 'b'],
    });
  });
});

describe('omitKey', () => {
  test('removes one key, leaving the rest untouched', () => {
    assert.deepEqual(omitKey({ a: 1, b: 2 }, 'a'), { b: 2 });
  });

  test('removing an absent key is a copy', () => {
    assert.deepEqual(omitKey({ a: 1 }, 'zz'), { a: 1 });
    assert.deepEqual(omitKey({}, 'a'), {});
  });
});

describe('sortByOrder / groupsInOrder', () => {
  test('ids follow the saved order', () => {
    assert.deepEqual(sortByOrder(['a', 'b', 'c'], ['c', 'a', 'b']), ['c', 'a', 'b']);
  });

  test('ids the order never mentioned keep their place at the end', () => {
    assert.deepEqual(sortByOrder(['a', 'b', 'c', 'd'], ['c']), ['c', 'a', 'b', 'd']);
  });

  test('without an order the list is unchanged', () => {
    assert.deepEqual(sortByOrder(['a', 'b'], undefined), ['a', 'b']);
    assert.deepEqual(sortByOrder([], ['a']), []);
  });

  test('groupsInOrder reorders each day it has an order for', () => {
    const days = [day('2026-07-10', ['a', 'b']), day('2026-07-11', ['c', 'd'])];
    assert.deepEqual(groupsInOrder(days, { '2026-07-10': ['b', 'a'] }), [
      { day: '2026-07-10', ids: ['b', 'a'] },
      { day: '2026-07-11', ids: ['c', 'd'] },
    ]);
  });

  test('no saved order at all leaves every day as built', () => {
    const days = [day('2026-07-10', ['a', 'b'])];
    assert.deepEqual(groupsInOrder(days, {}), [{ day: '2026-07-10', ids: ['a', 'b'] }]);
  });
});

describe('stopsOfDay / stopsOfGroups', () => {
  const days = [day('2026-07-10', ['a', 'b'])];

  test('stopsOfDay picks the day out of a built route', () => {
    assert.deepEqual(stopsOfDay(days, '2026-07-10').map((s) => s.id), ['a', 'b']);
    assert.deepEqual(stopsOfDay(days, '2026-07-99'), []);
  });

  test('stopsOfGroups resolves ids, dropping ones the corpus no longer knows', () => {
    const byId = new Map([['a', stop({ id: 'a', s: '2026-07-10' })]]);
    const groups = [{ day: '2026-07-10', ids: ['a', 'gone'] }];
    assert.deepEqual(stopsOfGroups(groups, '2026-07-10', byId).map((s) => s.id), ['a']);
    assert.deepEqual(stopsOfGroups(groups, 'other', byId), []);
  });
});

describe('flowStartMin', () => {
  const schedule = [scheduled('a', 540), scheduled('b', 660)];

  test('reports where the sequence puts the stop on its own', () => {
    assert.equal(flowStartMin(schedule, 'b', 0), 660);
  });

  test('falls back when the schedule does not hold the stop', () => {
    assert.equal(flowStartMin(schedule, 'gone', 123), 123);
  });
});

describe('timesAfterMove', () => {
  test('a drop well below the natural slot pins the stop', () => {
    assert.deepEqual(timesAfterMove({}, 'a', 660, 540), { a: '11:00' });
  });

  test('a drop at, above, or barely below the natural slot clears any pin', () => {
    assert.deepEqual(timesAfterMove({ a: '09:00', b: '10:00' }, 'a', 540, 540), { b: '10:00' });
    assert.deepEqual(timesAfterMove({ a: '09:00' }, 'a', 500, 540), {});
    assert.deepEqual(timesAfterMove({ a: '09:00' }, 'a', 550, 540), {}); // 10 min is the slack
  });

  test('one minute past the slack does pin', () => {
    assert.deepEqual(timesAfterMove({}, 'a', 551, 540), { a: '09:11' });
  });
});

describe('breakAnchorAt', () => {
  const schedule = [scheduled('a', 540), scheduled('b', 660), scheduled('c', 780)];

  test('anchors to the last stop that starts at or before the drop', () => {
    assert.equal(breakAnchorAt(schedule, 700), 'b');
    assert.equal(breakAnchorAt(schedule, 660), 'b');
    assert.equal(breakAnchorAt(schedule, 900), 'c');
  });

  test('a drop above the first stop stays anchored to it', () => {
    assert.equal(breakAnchorAt(schedule, 0), 'a');
  });

  test('an empty day has no anchor', () => {
    assert.equal(breakAnchorAt([], 600), undefined);
  });
});

describe('addPause / movePause', () => {
  test('adding drops a standard hour, or lengthens the break already there', () => {
    assert.deepEqual(addPause({}, 'a'), { a: 60 });
    assert.deepEqual(addPause({ a: 60 }, 'a'), { a: 120 });
  });

  test('moving carries the break to its new anchor', () => {
    assert.deepEqual(movePause({ a: 45, b: 10 }, 'a', 'c'), { b: 10, c: 45 });
  });

  test('moving onto an anchor that already has a break merges them', () => {
    assert.deepEqual(movePause({ a: 45, b: 30 }, 'a', 'b'), { b: 75 });
  });

  test('moving a break that is not there drops the standard hour instead', () => {
    assert.deepEqual(movePause({}, 'a', 'b'), { b: 60 });
  });

  test('re-dropping a break on its own anchor keeps its length', () => {
    assert.deepEqual(movePause({ a: 45 }, 'a', 'a'), { a: 45 });
  });
});

describe('nextDayHours / dayWindow', () => {
  test('both ends set stores the override', () => {
    assert.deepEqual(nextDayHours({}, 'd', '08:00', '20:00'), { d: { start: '08:00', end: '20:00' } });
  });

  test('a half-filled pair clears the override rather than storing it', () => {
    const before = { d: { start: '08:00', end: '20:00' } };
    assert.deepEqual(nextDayHours(before, 'd', '08:00', ''), {});
    assert.deepEqual(nextDayHours(before, 'd', '', ''), {});
  });

  test('dayWindow reads the clock times as minutes since midnight', () => {
    assert.deepEqual(dayWindow({ start: '08:30', end: '20:00' }), { startMin: 510, endMin: 1200 });
  });

  test('an unparseable window falls back to 09:00–22:00', () => {
    assert.deepEqual(dayWindow({ start: 'x', end: 'y' }), { startMin: 540, endMin: 1320 });
  });
});

describe('stealDurations', () => {
  const stops = [
    stop({ id: 'a', s: '2026-07-10' }),
    stop({ id: 'b', s: '2026-07-10' }),
    stop({ id: 'c', s: '2026-07-10' }),
  ];

  test('growing takes the minutes off the stops that follow', () => {
    assert.deepEqual(stealDurations(stops, 'a', 120, {}), { a: 120, b: 60 });
  });

  test('a big grow keeps taking until it is satisfied', () => {
    assert.deepEqual(stealDurations(stops, 'a', 210, {}), { a: 210, b: 15, c: 45 });
  });

  test('no stop is shrunk below fifteen minutes', () => {
    const pair = [stops[0]!, stops[1]!];
    assert.deepEqual(stealDurations(pair, 'a', 400, { b: 20 }), { a: 400, b: 15 });
  });

  test('shrinking just sets it — nothing else moves', () => {
    assert.deepEqual(stealDurations(stops, 'a', 60, {}), { a: 60 });
  });

  test('the last stop of a day has nothing to steal from', () => {
    assert.deepEqual(stealDurations(stops, 'c', 200, {}), { c: 200 });
  });

  test('a stop the day does not hold changes nothing at all', () => {
    assert.equal(stealDurations(stops, 'gone', 120, {}), undefined);
  });
});

describe('toMode / toView / dateRange', () => {
  test('only driving and transit are chosen; anything else walks', () => {
    assert.equal(toMode('driving'), 'driving');
    assert.equal(toMode('transit'), 'transit');
    assert.equal(toMode('walking'), 'walking');
    assert.equal(toMode(undefined), 'walking');
    assert.equal(toMode('nonsense'), 'walking');
  });

  test('only "timeline" chooses the timeline', () => {
    assert.equal(toView('timeline'), 'timeline');
    assert.equal(toView('list'), 'list');
    assert.equal(toView(undefined), 'list');
  });

  test('an open-ended trip leaves `to` off the range entirely', () => {
    const open = dateRange('2026-07-10', undefined);
    assert.deepEqual(open, { from: '2026-07-10' });
    assert.equal('to' in open, false);
    assert.deepEqual(dateRange('2026-07-10', '2026-07-12'), {
      from: '2026-07-10',
      to: '2026-07-12',
    });
  });
});

describe('flattenCommit / commitTarget / makeCommitRouter', () => {
  test('every drag kind flattens to the same shape', () => {
    assert.deepEqual(flattenCommit({ kind: 'move', id: 'a', day: 'd', index: 2, startMin: 600 }), {
      kind: 'move',
      id: 'a',
      day: 'd',
      index: 2,
      startMin: 600,
      durMin: 0,
    });
    assert.deepEqual(flattenCommit({ kind: 'resize', id: 'a', day: 'd', durMin: 45 }), {
      kind: 'resize',
      id: 'a',
      day: 'd',
      index: 0,
      startMin: 0,
      durMin: 45,
    });
    assert.deepEqual(
      flattenCommit({ kind: 'resize-top', id: 'a', day: 'd', startMin: 600, durMin: 45 }),
      { kind: 'resize-top', id: 'a', day: 'd', index: 0, startMin: 600, durMin: 45 },
    );
  });

  test('a break id names the stop it is anchored to', () => {
    assert.deepEqual(commitTarget('break:stop-1'), { kind: 'break', ref: 'stop-1' });
    assert.deepEqual(commitTarget('stop-1'), { kind: 'stop', ref: 'stop-1' });
    assert.deepEqual(commitTarget('break:'), { kind: 'break', ref: '' });
  });

  const record = () => {
    const calls: string[] = [];
    const router = makeCommitRouter({
      breakMove: (anchor, d, startMin) => calls.push(`breakMove:${anchor}:${d}:${startMin}`),
      breakResize: (anchor, durMin) => calls.push(`breakResize:${anchor}:${durMin}`),
      move: (id, d, index, startMin) => calls.push(`move:${id}:${d}:${index}:${startMin}`),
      resizeTop: (id, d, startMin, durMin) => calls.push(`resizeTop:${id}:${d}:${startMin}:${durMin}`),
      resize: (id, d, durMin) => calls.push(`resize:${id}:${d}:${durMin}`),
    });
    return { calls, router };
  };

  test('a real stop routes to the stop handlers, with its own id', () => {
    const { calls, router } = record();
    router({ kind: 'move', id: 'a', day: 'd', index: 1, startMin: 600 });
    router({ kind: 'resize', id: 'a', day: 'd', durMin: 45 });
    router({ kind: 'resize-top', id: 'a', day: 'd', startMin: 600, durMin: 45 });
    assert.deepEqual(calls, ['move:a:d:1:600', 'resize:a:d:45', 'resizeTop:a:d:600:45']);
  });

  test('a break routes to the break handlers, with the anchor id', () => {
    const { calls, router } = record();
    router({ kind: 'move', id: 'break:a', day: 'd', index: 1, startMin: 600 });
    router({ kind: 'resize', id: 'break:a', day: 'd', durMin: 30 });
    assert.deepEqual(calls, ['breakMove:a:d:600', 'breakResize:a:30']);
  });

  test('a break has no top edge, so a top-resize does nothing', () => {
    const { calls, router } = record();
    router({ kind: 'resize-top', id: 'break:a', day: 'd', startMin: 600, durMin: 30 });
    assert.deepEqual(calls, []);
  });
});

describe('saving a generated route', () => {
  const days = [day('2026-07-10', ['a', 'b']), day('2026-07-11', ['c'])];

  test('the name is the first day and the stop count', () => {
    assert.equal(routeSaveName(days), '2026-07-10 (3)');
    assert.equal(routeSaveName([]), 'Route');
  });

  test('only the overrides belonging to this route are embedded', () => {
    assert.deepEqual(pickDurations(days, { a: 120, zz: 30 }), { a: 120 });
    assert.deepEqual(pickDurations([], { a: 120 }), {});
  });

  test('only the POIs actually placed are embedded', () => {
    assert.deepEqual(pickPois(new Set(['a']), { a: 1, b: 2 }), { a: 1 });
    assert.deepEqual(pickPois(new Set(), { a: 1 }), {});
  });

  test('the payload carries the arrangement and the picked durations', () => {
    const body: unknown = JSON.parse(
      savedRouteBody({
        mode: 'transit',
        range: { from: '2026-07-10' },
        days,
        durations: { a: 120, zz: 30 },
        times: { a: '10:00' },
        pauses: { a: 60 },
        pois: {},
      }),
    );
    assert.deepEqual(body, {
      mode: 'transit',
      range: { from: '2026-07-10' },
      dayIds: [
        { day: '2026-07-10', ids: ['a', 'b'] },
        { day: '2026-07-11', ids: ['c'] },
      ],
      durations: { a: 120 },
      times: { a: '10:00' },
      pauses: { a: 60 },
      pois: {},
    });
  });

  test('a save response needs both an id and a URL to count', () => {
    assert.deepEqual(asSavedRoute({ id: 'r1', url: '/route/r1' }), [{ id: 'r1', url: '/route/r1' }]);
    assert.deepEqual(asSavedRoute({ id: 'r1' }), []);
    assert.deepEqual(asSavedRoute(undefined), []);
  });

  test('an edit token comes through when the API sent one', () => {
    assert.deepEqual(asSavedRoute({ id: 'r1', url: '/u', editToken: 'tok' }), [
      { id: 'r1', url: '/u', editToken: 'tok' },
    ]);
  });

  test('the local list puts the new route first and drops an older copy', () => {
    const route = { id: 'r1', name: 'n', data: '{}' };
    const previous = [{ id: 'r1', name: 'old' }, { id: 'r2', name: 'keep' }];
    assert.deepEqual(nextRememberedRoutes(previous, route, 7), [
      { id: 'r1', name: 'n', data: '{}', createdAt: 7 },
      { id: 'r2', name: 'keep' },
    ]);
  });

  test('a corrupted local list is replaced, and the list stays capped at 50', () => {
    const route = { id: 'r1', name: 'n', data: '{}' };
    assert.deepEqual(nextRememberedRoutes('nonsense', route, 7), [
      { id: 'r1', name: 'n', data: '{}', createdAt: 7 },
    ]);
    const many = Array.from({ length: 80 }, (_, i) => ({ id: `x${i}` }));
    assert.equal(nextRememberedRoutes(many, route, 7).length, 50);
  });
});

describe('generated-route markup', () => {
  test('the share line escapes the label and the visible URL', () => {
    assert.equal(
      shareLinkHtml('https://x/route/1', 'Link "A"'),
      '<span>Link &#34;A&#34;</span> <a href="https://x/route/1">https://x/route/1</a>',
    );
  });

  test('the span names both ends of the trip', () => {
    const html = routeSpanHtml('2026-07-04', '2026-07-06', 'en');
    assert.ok(html.startsWith('<p class="route-span">'));
    assert.ok(html.includes('Saturday'));
    assert.ok(html.includes('Monday'));
    assert.ok(html.includes(' → '));
  });

  test('the view toggle presses exactly the active view', () => {
    const html = viewToggleHtml('timeline', { list: 'List', timeline: 'Timeline' }, 'route-views');
    assert.ok(html.includes('<div class="route-views" role="group">'));
    assert.ok(html.includes('data-route-view="list" aria-pressed="false"'));
    assert.ok(html.includes('data-route-view="timeline" aria-pressed="true"'));
  });

  test('the toggle labels are escaped and the group class is caller-chosen', () => {
    const html = viewToggleHtml('list', { list: '<L>', timeline: 'T' }, 'route-views no-print');
    assert.ok(html.includes('class="route-views no-print"'));
    assert.ok(html.includes('>&#60;L&#62;<'));
  });
});

describe('genPayload', () => {
  test('carries the live arrangement and leaves the saved-only fields empty', () => {
    const payload = genPayload({
      mode: 'driving',
      durations: { a: 120 },
      times: { a: '10:00' },
      pauses: { a: 60 },
      dayHours: { d: { start: '08:00', end: '20:00' } },
    });
    assert.equal(payload.mode, 'driving');
    assert.deepEqual(payload.durations, { a: 120 });
    assert.deepEqual(payload.times, { a: '10:00' });
    assert.deepEqual(payload.pauses, { a: 60 });
    assert.deepEqual(payload.dayHours, { d: { start: '08:00', end: '20:00' } });
    assert.deepEqual(payload.groups, []);
    assert.deepEqual(payload.pois, {});
    assert.equal(payload.dayStart, '');
    assert.equal(payload.dayEnd, '');
    assert.equal(payload.base, undefined);
  });
});
