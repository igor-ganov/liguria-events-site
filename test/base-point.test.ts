import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { effectiveBase, legTo } from '../src/lib/favorites/base-point.ts';

const g = { lat: 44.0, lng: 8.0, label: 'global hotel' };
const r = { lat: 44.4, lng: 8.9, label: 'route hotel' };
const d = { lat: 44.41, lng: 8.93, label: 'day hotel' };

describe('effectiveBase precedence: day > route > global', () => {
  test('per-day base wins', () => {
    assert.deepEqual(effectiveBase('2026-07-10', { '2026-07-10': d }, r, g), d);
  });
  test('route base when no per-day', () => {
    assert.deepEqual(effectiveBase('2026-07-10', {}, r, g), r);
  });
  test('global when no route', () => {
    assert.deepEqual(effectiveBase('2026-07-10', {}, undefined, g), g);
  });
  test('undefined when nothing set', () => {
    assert.equal(effectiveBase('2026-07-10', {}, undefined, undefined), undefined);
  });
});

describe('legTo', () => {
  test('computes a real leg (distance, minutes, maps link) between two points', () => {
    const leg = legTo([44.4, 8.9], [44.41, 9.0], 'walking');
    assert.ok(leg.meters > 0);
    assert.ok(leg.minutes > 0);
    assert.ok(leg.mapsUrl.includes('travelmode=walking'));
    assert.equal(leg.tight, false);
  });
});
