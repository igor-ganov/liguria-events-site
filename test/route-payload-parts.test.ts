import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { entriesOf } from '../src/components/favorites/entries-of.ts';
import { isString } from '../src/components/favorites/is-string.ts';
import { asTime } from '../src/components/favorites/as-time.ts';
import { asDayHoursMap } from '../src/components/favorites/as-day-hours-map.ts';
import { asGroups } from '../src/components/favorites/as-groups.ts';
import { asPointMap } from '../src/components/favorites/as-point-map.ts';
import { parsePayload } from '../src/components/favorites/parse-payload.ts';
import { serializePayload } from '../src/components/favorites/serialize-payload.ts';

describe('isString', () => {
  test('narrows a list to its strings', () => {
    assert.deepEqual([1, 'a', undefined, '', {}].filter(isString), ['a', '']);
  });
});

describe('entriesOf', () => {
  test('reads an object as entries', () => {
    assert.deepEqual(entriesOf({ a: 1, b: 'x' }), [
      ['a', 1],
      ['b', 'x'],
    ]);
  });

  test('anything that is not an object has no entries', () => {
    assert.deepEqual(entriesOf(undefined), []);
    assert.deepEqual(entriesOf('nope'), []);
    assert.deepEqual(entriesOf(7), []);
  });
});

describe('asTime', () => {
  test('accepts a well-formed 24-hour clock time', () => {
    assert.equal(asTime('00:00'), '00:00');
    assert.equal(asTime('23:59'), '23:59');
  });

  test('rejects anything else', () => {
    assert.equal(asTime('24:00'), '');
    assert.equal(asTime('9:05'), '');
    assert.equal(asTime('evening'), '');
    assert.equal(asTime(540), '');
    assert.equal(asTime(undefined), '');
  });
});

describe('asDayHoursMap', () => {
  test('keeps the days that carry a full window', () => {
    assert.deepEqual(asDayHoursMap({ '2026-07-10': { start: '08:00', end: '20:00' } }), {
      '2026-07-10': { start: '08:00', end: '20:00' },
    });
  });

  test('drops a day missing or corrupting either end', () => {
    assert.deepEqual(asDayHoursMap({ a: { start: '08:00' }, b: { start: 'x', end: '20:00' }, c: 5 }), {});
  });

  test('a non-object reads as no overrides', () => {
    assert.deepEqual(asDayHoursMap(undefined), {});
  });
});

describe('asGroups', () => {
  test('keeps the day arrangement in order', () => {
    assert.deepEqual(asGroups([{ day: '2026-07-10', ids: ['a', 'b'] }]), [
      { day: '2026-07-10', ids: ['a', 'b'] },
    ]);
  });

  test('drops entries without a day string or an ids array', () => {
    assert.deepEqual(asGroups([{ ids: ['a'] }, { day: 5, ids: [] }, { day: 'x' }, 'nope']), []);
  });

  test('keeps only the string ids inside a day', () => {
    assert.deepEqual(asGroups([{ day: 'd', ids: ['a', 3, undefined, 'b'] }]), [{ day: 'd', ids: ['a', 'b'] }]);
  });

  test('a non-array reads as no arrangement', () => {
    assert.deepEqual(asGroups({ day: 'x' }), []);
  });
});

describe('asPointMap', () => {
  test('keeps the days whose point has both coordinates', () => {
    assert.deepEqual(asPointMap({ d1: { lat: 44.4, lng: 8.9 }, d2: { lat: 44.4 }, d3: 'x' }), {
      d1: { lat: 44.4, lng: 8.9 },
    });
  });
});

describe('parsePayload', () => {
  test('reads a full payload', () => {
    const payload = parsePayload(
      JSON.stringify({
        mode: 'transit',
        dayIds: [{ day: '2026-07-10', ids: ['a', 'b'] }],
        durations: { a: 45 },
        times: { a: '18:00' },
        pauses: { a: 30 },
        dayStart: '08:00',
        dayEnd: '20:00',
        dayHours: { '2026-07-10': { start: '09:00', end: '21:00' } },
        base: { lat: 44.41, lng: 8.93 },
        dayBases: { '2026-07-10': { lat: 44.4, lng: 8.9 } },
        dayFinals: { '2026-07-10': { lat: 44.3, lng: 9.2 } },
      }),
    );
    assert.equal(payload.mode, 'transit');
    assert.deepEqual(payload.groups, [{ day: '2026-07-10', ids: ['a', 'b'] }]);
    assert.deepEqual(payload.durations, { a: 45 });
    assert.deepEqual(payload.times, { a: '18:00' });
    assert.deepEqual(payload.pauses, { a: 30 });
    assert.equal(payload.dayStart, '08:00');
    assert.deepEqual(payload.base, { lat: 44.41, lng: 8.93 });
    assert.deepEqual(payload.dayFinals, { '2026-07-10': { lat: 44.3, lng: 9.2 } });
  });

  test('an empty payload defaults every field', () => {
    const payload = parsePayload('{}');
    assert.deepEqual(
      { ...payload },
      {
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
      },
    );
  });

  test('corrupted fields fall back rather than break the page', () => {
    const payload = parsePayload('{"mode":"teleport","dayIds":"nope","durations":{"a":"long"},"base":{"lat":"x"}}');
    assert.equal(payload.mode, 'walking');
    assert.deepEqual(payload.groups, []);
    assert.deepEqual(payload.durations, {});
    assert.equal(payload.base, undefined);
  });
});

describe('serializePayload', () => {
  test('round-trips through the parser unchanged', () => {
    const raw = JSON.stringify({
      mode: 'driving',
      dayIds: [{ day: '2026-07-10', ids: ['a'] }],
      durations: { a: 45 },
      times: {},
      pauses: {},
      pois: {},
      dayStart: '08:00',
      dayEnd: '20:00',
      dayHours: {},
      dayBases: {},
      dayFinals: {},
    });
    const once = parsePayload(raw);
    assert.deepEqual({ ...parsePayload(serializePayload(once)) }, { ...once });
  });

  test('writes the arrangement under the stored `dayIds` key', () => {
    const json: unknown = JSON.parse(serializePayload(parsePayload('{"dayIds":[{"day":"d","ids":["a"]}]}')));
    assert.deepEqual(Reflect.get(Object(json), 'dayIds'), [{ day: 'd', ids: ['a'] }]);
  });
});
