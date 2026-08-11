import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { resolveNext } from '../src/lib/favorites/resolve-next.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (id: string): CompactEvent => ({ id, t: id.toUpperCase(), s: '2026-07-10', c: ['other'], u: 'https://x' });
const a = ev('a');
const b = ev('b');
const c = ev('c');
const DS = 9 * 60; // 09:00
const DE = 22 * 60; // 22:00

describe('resolveNext (pin one stop, fix only the next)', () => {
  test('no overlap → nothing moves', () => {
    // a pinned 10:00; b flows to 11:00 — already clear.
    const res = resolveNext([a, b], 'walking', {}, { a: 60, b: 60 }, {}, DS, DE, 'a', 600);
    assert.equal(res.times['b'], undefined);
  });

  test('overlap → the next stop goes into the slot right AFTER', () => {
    // b pinned 10:00; drop a onto 10:30 → b is pushed to just after a (11:30).
    const res = resolveNext([a, b], 'walking', { b: '10:00' }, { a: 60, b: 60 }, {}, DS, DE, 'a', 630);
    assert.equal(res.times['b'], '11:30');
  });

  test('no room after (next stop pinned tight) → BEFORE the moved stop', () => {
    // c pinned right after a leaves no after-gap; b fits before a instead.
    const res = resolveNext([a, b, c], 'walking', { b: '12:00', c: '13:00' }, { a: 60, b: 60, c: 60 }, {}, DS, DE, 'a', 720);
    assert.equal(res.times['b'], '11:00');
  });

  test('no room either side → SHRINK into the after-gap', () => {
    // a at the day start (no before room), c 30 min after a (no whole after room).
    const res = resolveNext([a, b, c], 'walking', { b: '09:00', c: '10:30' }, { a: 60, b: 60, c: 60 }, {}, DS, DE, 'a', 540);
    assert.equal(res.times['b'], '10:00');
    assert.equal(res.durations['b'], 30);
  });
});
