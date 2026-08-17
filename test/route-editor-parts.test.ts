import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { addSelectHtml } from '../src/components/favorites/add-select-html.ts';
import { armedDayKind } from '../src/components/favorites/armed-day-kind.ts';
import { baseControlHtml } from '../src/components/favorites/base-control-html.ts';
import { controlsHtml } from '../src/components/favorites/controls-html.ts';
import { dayBaseControlsHtml } from '../src/components/favorites/day-base-controls-html.ts';
import { dayHoursControlHtml } from '../src/components/favorites/day-hours-control-html.ts';
import { dayNumbers } from '../src/components/favorites/day-numbers.ts';
import { disabledAttr } from '../src/components/favorites/disabled-attr.ts';
import { moveSelectHtml } from '../src/components/favorites/move-select-html.ts';
import { payloadWithPoint } from '../src/components/favorites/payload-with-point.ts';
import { pickKey } from '../src/components/favorites/pick-key.ts';
import { pressedAttr } from '../src/components/favorites/pressed-attr.ts';
import { togglePick } from '../src/components/favorites/toggle-pick.ts';
import type { Payload } from '../src/components/favorites/route-payload.ts';
import type { PickMode } from '../src/components/favorites/pick-mode.ts';
import type { RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';

const stop = (id: string): RouteStop => ({ id, t: id, s: '2026-07-10', c: ['other'], u: 'https://x' });

const day = (name: string, ids: readonly string[]): RouteDay => ({
  day: name,
  stops: ids.map(stop),
  legs: [],
});

const EMPTY: Payload = {
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
};

const POINT = { lat: 44.4, lng: 8.94 };

describe('dayNumbers', () => {
  test('numbering runs on across days', () => {
    const days = [day('d1', ['a', 'b']), day('d2', ['c']), day('d3', ['d', 'e'])];
    assert.deepEqual(dayNumbers(days), [0, 2, 3]);
  });

  test('the first day always starts at zero, and an empty route has no offsets', () => {
    assert.deepEqual(dayNumbers([day('d1', ['a'])]), [0]);
    assert.deepEqual(dayNumbers([]), []);
  });
});

describe('pickKey', () => {
  test('scope decides first — only a day pick distinguishes base from final', () => {
    assert.equal(pickKey({ scope: 'global', kind: 'base' }), 'global');
    assert.equal(pickKey({ scope: 'route', kind: 'base' }), 'route');
    assert.equal(pickKey({ scope: 'day', day: 'd1', kind: 'base' }), 'day-base');
    assert.equal(pickKey({ scope: 'day', day: 'd1', kind: 'final' }), 'day-final');
  });
});

describe('payloadWithPoint', () => {
  test('a route pick sets the route base', () => {
    const next = payloadWithPoint(EMPTY, { scope: 'route', kind: 'base' }, POINT);
    assert.deepEqual(next.base, POINT);
    assert.deepEqual(next.dayBases, {});
  });

  test('a day pick sets that day only, keeping the other days', () => {
    const before = { ...EMPTY, dayBases: { d0: POINT } };
    const next = payloadWithPoint(before, { scope: 'day', day: 'd1', kind: 'base' }, POINT);
    assert.deepEqual(next.dayBases, { d0: POINT, d1: POINT });
    assert.deepEqual(next.dayFinals, {});
  });

  test('a final pick writes the day finals, not the day bases', () => {
    const next = payloadWithPoint(EMPTY, { scope: 'day', day: 'd1', kind: 'final' }, POINT);
    assert.deepEqual(next.dayFinals, { d1: POINT });
    assert.deepEqual(next.dayBases, {});
  });

  test('a global pick leaves the payload alone — it is not part of the route', () => {
    assert.equal(payloadWithPoint(EMPTY, { scope: 'global', kind: 'base' }, POINT), EMPTY);
  });

  test('a day pick without a day falls back to the empty day key', () => {
    const next = payloadWithPoint(EMPTY, { scope: 'day', kind: 'base' }, POINT);
    assert.deepEqual(next.dayBases, { '': POINT });
  });
});

describe('togglePick / armedDayKind', () => {
  const routeBase: PickMode = { scope: 'route', kind: 'base' };

  test('arming from nothing arms the picker', () => {
    assert.deepEqual(togglePick(undefined, routeBase), routeBase);
  });

  test('arming the picker that is already armed disarms it', () => {
    assert.equal(togglePick(routeBase, routeBase), undefined);
  });

  test('arming a different picker switches to it', () => {
    const global: PickMode = { scope: 'global', kind: 'base' };
    assert.deepEqual(togglePick(routeBase, global), global);
  });

  test('the same scope on a different day is a different picker', () => {
    const d1: PickMode = { scope: 'day', day: 'd1', kind: 'base' };
    const d2: PickMode = { scope: 'day', day: 'd2', kind: 'base' };
    assert.deepEqual(togglePick(d1, d2), d2);
    assert.equal(togglePick(d1, d1), undefined);
  });

  test('armedDayKind reports which of a day’s two pickers is armed', () => {
    assert.equal(armedDayKind({ scope: 'day', day: 'd1', kind: 'final' }, 'd1'), 'final');
    assert.equal(armedDayKind({ scope: 'day', day: 'd1', kind: 'base' }, 'd2'), undefined);
    assert.equal(armedDayKind({ scope: 'route', kind: 'base' }, 'd1'), undefined);
    assert.equal(armedDayKind(undefined, 'd1'), undefined);
  });
});

describe('attribute helpers', () => {
  test('an attribute is emitted only when it applies', () => {
    assert.equal(disabledAttr(true), ' disabled');
    assert.equal(disabledAttr(false), '');
    assert.equal(pressedAttr(true), ' aria-pressed="true"');
    assert.equal(pressedAttr(false), '');
  });
});

describe('moveSelectHtml / addSelectHtml', () => {
  const options = [{ value: 'd2', label: 'Sunday' }];

  test('the move dropdown carries the stop, its day and every target day', () => {
    const html = moveSelectHtml('e1', 'd1', options, 'Move');
    assert.ok(html.includes('data-op="move" data-id="e1" data-from="d1"'));
    assert.ok(html.includes('<option value="">Move</option>'));
    assert.ok(html.includes('<option value="d2">Sunday</option>'));
  });

  test('the add dropdown carries the day and every addable favourite', () => {
    const html = addSelectHtml('d1', [{ value: 'e9', label: 'Concert' }], 'Add');
    assert.ok(html.startsWith('<div class="route-add">'));
    assert.ok(html.includes('data-op="add" data-day="d1"'));
    assert.ok(html.includes('<option value="e9">Concert</option>'));
  });

  test('neither dropdown renders at all with nothing to choose', () => {
    assert.equal(moveSelectHtml('e1', 'd1', [], 'Move'), '');
    assert.equal(addSelectHtml('d1', [], 'Add'), '');
  });

  test('values and labels are escaped', () => {
    const html = addSelectHtml('d1', [{ value: 'a"b', label: '<x>' }], 'Add');
    assert.ok(html.includes('value="a&#34;b"'));
    assert.ok(html.includes('>&#60;x&#62;<'));
  });
});

describe('controlsHtml', () => {
  const labels = { moveUp: 'Up', moveDown: 'Down', remove: 'Remove' };

  test('carries the op, the stop and the day on every button', () => {
    const html = controlsHtml('e1', 'd1', 1, 2, '', labels);
    assert.ok(html.includes('data-op="up" data-id="e1" data-day="d1"'));
    assert.ok(html.includes('data-op="down" data-id="e1" data-day="d1"'));
    assert.ok(html.includes('data-op="remove" data-id="e1" data-day="d1"'));
  });

  test('the first stop cannot move up and the last cannot move down', () => {
    assert.ok(controlsHtml('e1', 'd1', 0, 2, '', labels).includes('data-op="up" data-id="e1" data-day="d1" disabled'));
    assert.ok(!controlsHtml('e1', 'd1', 0, 2, '', labels).includes('data-op="down" data-id="e1" data-day="d1" disabled'));
    assert.ok(controlsHtml('e1', 'd1', 2, 2, '', labels).includes('data-op="down" data-id="e1" data-day="d1" disabled'));
  });

  test('a lone stop is both first and last', () => {
    const html = controlsHtml('e1', 'd1', 0, 0, '', labels);
    assert.equal(html.split(' disabled').length - 1, 2);
  });

  test('the move dropdown is placed between the arrows and remove', () => {
    const html = controlsHtml('e1', 'd1', 1, 2, '<select id="m"></select>', labels);
    assert.ok(html.indexOf('<select id="m">') > html.indexOf('data-op="down"'));
    assert.ok(html.indexOf('<select id="m">') < html.indexOf('data-op="remove"'));
  });
});

describe('dayBaseControlsHtml', () => {
  test('presses only the armed picker', () => {
    const html = dayBaseControlsHtml('d1', 'final', { dayBase: 'Base', dayFinal: 'Final' });
    assert.ok(html.includes('data-pick-base data-day="d1">'));
    assert.ok(html.includes('data-pick-final data-day="d1" aria-pressed="true"'));
  });

  test('with nothing armed neither button is pressed', () => {
    const html = dayBaseControlsHtml('d1', undefined, { dayBase: 'Base', dayFinal: 'Final' });
    assert.equal(html.includes('aria-pressed'), false);
  });
});

describe('baseControlHtml', () => {
  const labels = { setBase: 'Base', setBaseDefault: 'Default', clearBase: 'Clear', clickMap: 'Click' };

  test('the clear button appears only when the route has its own base', () => {
    assert.ok(baseControlHtml(undefined, true, labels).includes('data-clear-base'));
    assert.equal(baseControlHtml(undefined, false, labels).includes('data-clear-base'), false);
  });

  test('the click-the-map hint appears only while a picker is armed', () => {
    assert.ok(baseControlHtml('route', false, labels).includes('route-pick-hint'));
    assert.equal(baseControlHtml(undefined, false, labels).includes('route-pick-hint'), false);
  });

  test('the armed scope is the pressed chip', () => {
    const html = baseControlHtml('global', false, labels);
    assert.ok(html.includes('data-pick-base-global aria-pressed="true"'));
    assert.equal(html.includes('data-pick-base-route aria-pressed'), false);
  });
});

describe('dayHoursControlHtml', () => {
  test('renders the route window into both time inputs', () => {
    const html = dayHoursControlHtml('08:00', '20:00', { day: 'Day', setDefault: 'Default' });
    assert.ok(html.includes('data-route-day-start value="08:00"'));
    assert.ok(html.includes('data-route-day-end value="20:00"'));
    assert.ok(html.includes('data-route-day-default'));
  });

  test('an unset window leaves the inputs empty', () => {
    const html = dayHoursControlHtml('', '', { day: 'Day', setDefault: 'Default' });
    assert.ok(html.includes('data-route-day-start value=""'));
    assert.ok(html.includes('data-route-day-end value=""'));
  });
});
