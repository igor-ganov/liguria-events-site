import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { placeIndex } from '../src/lib/region/place-index.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const events: readonly CompactEvent[] = [
  { id: 'a', t: 'X', s: '2026-08-25', c: ['music'], u: 'https://x', rg: 'liguria', ct: 'genova' },
];

describe('placeIndex', () => {
  test('the canonical list wins when the collector answers', () => {
    const index = placeIndex({ liguria: ['genova', 'imperia', 'la-spezia', 'savona'] }, events);
    // Savona has no events and must still have a page — that is the whole point.
    assert.deepEqual(index['liguria'], ['genova', 'imperia', 'la-spezia', 'savona']);
  });

  test('an unreachable place list falls back to the cities the events reveal', () => {
    // Without this, one outage would delete every city page from the build —
    // a far worse failure than the one being fixed.
    assert.deepEqual(placeIndex(undefined, events)['liguria'], ['genova']);
    assert.deepEqual(placeIndex({}, events)['liguria'], ['genova']);
  });

  test('a malformed entry is ignored rather than trusted', () => {
    const index = placeIndex({ liguria: ['genova'], lombardia: 'milano' }, events);
    assert.deepEqual(index['liguria'], ['genova']);
    assert.equal(index['lombardia'], undefined);
  });
});
