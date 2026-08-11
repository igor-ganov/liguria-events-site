import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { routePdfLines } from '../src/lib/favorites/route-pdf-lines.ts';
import type { Leg, RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';

const stop = (id: string, g?: readonly [number, number], h?: string): RouteStop => ({
  id,
  t: id,
  s: '2026-07-04',
  u: '',
  c: ['other'],
  du: 60,
  ...(g ? { g } : {}),
  ...(h ? { h } : {}),
});

const leg: Leg = { meters: 1200, minutes: 15, mapsUrl: '', tight: false, transfers: 1 };
const days: readonly RouteDay[] = [
  { day: '2026-07-04', stops: [stop('a', [44.4, 8.9]), stop('b', [44.41, 8.94])], legs: [leg] },
];

const opts = {
  title: 'My Trip',
  lang: 'en' as const,
  mode: 'transit' as const,
  durations: {},
  labels: { min: 'min', fromBase: 'From base', toBase: 'To base' },
};

test('routePdfLines: title, day heading, numbered stops, a leg with mode + transfers', () => {
  const lines = routePdfLines(days, opts);
  assert.equal(lines[0]!.kind, 'title');
  assert.equal(lines[0]!.text, 'My Trip');
  assert.ok(lines.some((l) => l.kind === 'day'));
  const stops = lines.filter((l) => l.kind === 'stop');
  assert.equal(stops.length, 2);
  assert.ok(stops[0]!.text.startsWith('1. '));
  const legLine = lines.find((l) => l.kind === 'leg');
  assert.ok(legLine!.text.includes('1.2 km'));
  assert.ok(legLine!.text.includes('15 min'));
  assert.ok(legLine!.text.includes('transit'));
  assert.ok(legLine!.text.includes('1⇄'));
});

test('routePdfLines: from/to base lines appear when a base is set', () => {
  const withBase = routePdfLines(days, { ...opts, baseOf: () => ({ base: { lat: 44.39, lng: 8.9, label: 'Hotel' } }) });
  const baseLines = withBase.filter((l) => l.kind === 'base');
  assert.equal(baseLines.length, 2);
  assert.ok(baseLines[0]!.text.includes('From base'));
});
