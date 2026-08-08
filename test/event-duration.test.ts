import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventDuration, formatDuration } from '../src/lib/favorites/event-duration.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (o: Partial<CompactEvent>): CompactEvent => ({ id: 'x', t: 'X', s: '2099-01-01', c: ['other'], u: 'https://x', ...o });

describe('eventDuration', () => {
  test('a manual override wins over everything', () => {
    assert.equal(eventDuration(ev({ c: ['music'], du: 200 }), 45), 45);
  });
  test('a source-stated duration beats the category default', () => {
    assert.equal(eventDuration(ev({ c: ['music'], du: 200 })), 200);
  });
  test('a multi-category event takes the longest category default', () => {
    // market (60) + music (150) → 150
    assert.equal(eventDuration(ev({ c: ['market', 'music'] })), 150);
  });
  test('falls back to the single category default', () => {
    assert.equal(eventDuration(ev({ c: ['market'] })), 60);
  });
});

describe('formatDuration', () => {
  test('renders hours and minutes', () => {
    assert.equal(formatDuration(90), '1h 30m');
    assert.equal(formatDuration(120), '2h');
    assert.equal(formatDuration(45), '45m');
  });
});
