import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { routePdfLines } from '../src/lib/favorites/route-pdf-lines.ts';
import { distanceLabel } from '../src/lib/favorites/distance-label.ts';
import { dayLabel } from '../src/lib/favorites/day-label.ts';
import { legDetail } from '../src/lib/favorites/leg-detail.ts';
import { stopText } from '../src/lib/favorites/stop-text.ts';
import type { Leg, RouteDay, RouteStop } from '../src/lib/favorites/build-route.ts';

const stop = (id: string, g?: readonly [number, number], h?: string): RouteStop => ({
  id,
  t: id,
  s: '2026-07-04',
  u: '',
  c: ['other'],
  du: 60,
  ...(g && { g }),
  ...(h && { h }),
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

test('routePdfLines: no base lines, and no leg before the first stop, without a base', () => {
  const lines = routePdfLines(days, opts);
  assert.equal(lines.filter((l) => l.kind === 'base').length, 0);
  assert.equal(lines.filter((l) => l.kind === 'leg').length, 1);
  assert.equal(lines[2]!.kind, 'stop'); // title, day, first stop — nothing between
});

test('routePdfLines: a day final point replaces the base on the way back', () => {
  const lines = routePdfLines(days, {
    ...opts,
    baseOf: () => ({ base: { lat: 44.39, lng: 8.9 }, final: { lat: 44.5, lng: 9.1 } }),
  });
  const baseLines = lines.filter((l) => l.kind === 'base');
  assert.equal(baseLines.length, 2);
  assert.ok(baseLines[1]!.text.includes('To base'));
  assert.notEqual(baseLines[1]!.text, baseLines[0]!.text);
});

test('routePdfLines: stop numbering runs through the whole trip, not per day', () => {
  const secondDay: RouteDay = { day: '2026-07-05', stops: [stop('c', [44.42, 8.95])], legs: [] };
  const lines = routePdfLines([...days, secondDay], opts);
  const numbers = lines.filter((l) => l.kind === 'stop').map((l) => l.text.slice(0, 2));
  assert.deepEqual(numbers, ['1.', '2.', '3.']);
  assert.equal(lines.filter((l) => l.kind === 'day').length, 2);
});

test('routePdfLines: an empty itinerary is just the title', () => {
  assert.deepEqual(routePdfLines([], opts), [{ text: 'My Trip', kind: 'title' }]);
});

test('distanceLabel: metres below a kilometre, one decimal above', () => {
  assert.equal(distanceLabel(640), '640 m');
  assert.equal(distanceLabel(999), '999 m');
  assert.equal(distanceLabel(1000), '1.0 km');
  assert.equal(distanceLabel(1250), '1.3 km');
  assert.equal(distanceLabel(0), '0 m');
});

test('legDetail: the transfer count only appears when there is one', () => {
  const direct: Leg = { meters: 1200, minutes: 15, mapsUrl: '', tight: false };
  assert.equal(legDetail(leg, opts), '1.2 km · 15 min · 1⇄ · transit');
  assert.equal(legDetail({ ...leg, transfers: 0 }, opts), '1.2 km · 15 min · transit');
  assert.equal(legDetail(direct, opts), '1.2 km · 15 min · transit');
});

test('stopText: number, optional time, title, optional venue, duration', () => {
  assert.equal(stopText(stop('a'), 1, opts), '1. a  (1h)');
  assert.equal(stopText(stop('a', undefined, '18:00'), 2, opts), '2. 18:00  a  (1h)');
  assert.equal(stopText({ ...stop('a'), v: 'Teatro' }, 3, opts), '3. a — Teatro  (1h)');
});

test('stopText: a manual duration override wins over the stated one', () => {
  assert.equal(stopText(stop('a'), 1, { ...opts, durations: { a: 90 } }), '1. a  (1h 30m)');
});

test('dayLabel: a localized weekday and date, stable across timezones', () => {
  const label = dayLabel('2026-07-04', 'en');
  assert.ok(label.includes('Saturday'));
  assert.ok(label.includes('July'));
  assert.ok(label.includes('4'));
  assert.notEqual(dayLabel('2026-07-04', 'it'), label);
});
