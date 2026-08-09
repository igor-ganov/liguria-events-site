import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { DEFAULT_DAY_HOURS, effectiveDayHours } from '../src/lib/favorites/day-hours.ts';

const G = { start: '08:00', end: '20:00' }; // a "global default"

describe('effectiveDayHours precedence: day > route > global > default', () => {
  test('per-day override wins over everything', () => {
    const h = effectiveDayHours('2026-07-10', { '2026-07-10': { start: '11:00', end: '23:00' } }, { start: '10:00', end: '22:00' }, G);
    assert.deepEqual(h, { start: '11:00', end: '23:00' });
  });
  test('route setting used when no per-day override', () => {
    assert.deepEqual(effectiveDayHours('2026-07-10', {}, { start: '10:00', end: '22:00' }, G), { start: '10:00', end: '22:00' });
  });
  test('global used when no route setting', () => {
    assert.deepEqual(effectiveDayHours('2026-07-10', {}, undefined, G), G);
  });
  test('falls back to the built-in default when nothing is set', () => {
    assert.deepEqual(effectiveDayHours('2026-07-10', {}, undefined, undefined), DEFAULT_DAY_HOURS);
  });
});
