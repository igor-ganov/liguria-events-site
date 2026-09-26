// The favourite event: reported by the toggle itself, not by a delegated
// listener the capture handler stops from ever running.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { reportFavorite } from '../src/components/analytics/report-favorite.ts';

const withBeacon = (run: () => void): string[] => {
  const seen: string[] = [];
  const original = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = { pm: (event: string) => seen.push(event) };
  run();
  (globalThis as { window?: unknown }).window = original;
  return seen;
};

describe('reportFavorite', () => {
  test('an event added to favourites is reported', () => {
    assert.deepEqual(withBeacon(() => reportFavorite(true)), ['favorite']);
  });
  test('removing one is not: the funnel step is the intent to go', () => {
    assert.deepEqual(withBeacon(() => reportFavorite(false)), []);
  });
  test('it never throws when the beacon is absent', () => {
    const original = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = {};
    reportFavorite(true);
    (globalThis as { window?: unknown }).window = original;
  });
});
