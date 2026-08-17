import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { newById } from '../src/lib/map/new-by-id.ts';

// Correctness for newById lives in test/map-layer-parts.test.ts. This file pins
// its COMPLEXITY, which is the part that actually broke the map: the obvious
// `findIndex`-inside-`filter` form is quadratic, and two place shards (~68k
// venues) blocked the browser's main thread for minutes. A linear pass does the
// same work in tens of milliseconds, so a regression to the nested scan cannot
// pass this within the budget.
const venues = (count: number): readonly Readonly<{ id: string; lat: number }>[] =>
  Array.from({ length: count }, (_, index) => ({ id: `osm:node/${index}`, lat: 44 }));

describe('newById scaling', () => {
  test('dedupes two region shards worth of venues in well under a second', () => {
    const items = venues(68_000);
    const started = performance.now();
    const fresh = newById(new Set<string>())(items);
    const elapsed = performance.now() - started;
    assert.equal(fresh.length, 68_000);
    // Generous versus the ~20 ms a linear pass takes, and far below the ~13 s a
    // quadratic one needs at this size.
    assert.ok(elapsed < 1_000, `took ${Math.round(elapsed)}ms — is the dedupe quadratic again?`);
  });

  test('stays linear when most of the batch is already known', () => {
    const items = venues(40_000);
    const seen = new Set(items.slice(0, 39_000).map((item) => item.id));
    const started = performance.now();
    const fresh = newById(seen)(items);
    const elapsed = performance.now() - started;
    assert.equal(fresh.length, 1_000);
    assert.ok(elapsed < 1_000, `took ${Math.round(elapsed)}ms`);
  });
});
