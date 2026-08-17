import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { asPoint, effectiveBase, legTo, resolveDayBase } from '../src/lib/favorites/base-point.ts';

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

describe('resolveDayBase', () => {
  test('resolves the base by precedence and picks up the day-specific final point', () => {
    const f = { lat: 44.5, lng: 9.1, label: 'station' };
    assert.deepEqual(resolveDayBase('2026-07-10', { '2026-07-10': d }, r, g, { '2026-07-10': f }), {
      base: d,
      final: f,
    });
  });

  test('a day with no final point ends back at its base', () => {
    assert.deepEqual(resolveDayBase('2026-07-10', {}, r, g, {}), { base: r, final: undefined });
  });

  test('another day’s final point is not borrowed', () => {
    const out = resolveDayBase('2026-07-11', {}, r, g, { '2026-07-10': d });
    assert.equal(out.final, undefined);
  });
});

describe('asPoint', () => {
  test('reads bare coordinates, leaving the label absent rather than empty', () => {
    assert.deepEqual(asPoint({ lat: 44.4, lng: 8.93 }), { lat: 44.4, lng: 8.93 });
  });

  test('keeps a string label', () => {
    assert.deepEqual(asPoint({ lat: 44.4, lng: 8.93, label: 'hotel' }), { lat: 44.4, lng: 8.93, label: 'hotel' });
  });

  test('drops a label that is not a string', () => {
    assert.deepEqual(asPoint({ lat: 1, lng: 2, label: 7 }), { lat: 1, lng: 2 });
  });

  test('a missing or unusable coordinate means no point at all', () => {
    assert.equal(asPoint({ lat: 44.4 }), undefined);
    assert.equal(asPoint({ lat: '44.4', lng: '8.93' }), undefined);
    assert.equal(asPoint({ lat: Number.NaN, lng: 8.93 }), undefined);
  });

  test('survives values that are not objects at all', () => {
    assert.equal(asPoint(undefined), undefined);
    assert.equal(asPoint(0), undefined);
    assert.equal(asPoint('hotel'), undefined);
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
