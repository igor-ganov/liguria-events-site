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
  test('a shorter category default is NOT raised to the generic fallback', () => {
    assert.equal(eventDuration(ev({ c: ['market'] })), 60);
    assert.equal(eventDuration(ev({ c: ['market', 'market'] })), 60);
  });
  test('an event carrying no categories takes the generic fallback', () => {
    assert.equal(eventDuration(ev({ c: [] })), 90);
  });
  test('a non-positive override or stated duration is ignored', () => {
    assert.equal(eventDuration(ev({ c: ['market'] }), 0), 60);
    assert.equal(eventDuration(ev({ c: ['market'], du: 0 })), 60);
    assert.equal(eventDuration(ev({ c: ['market'] }), -5), 60);
  });
  test('a fractional duration is rounded', () => {
    assert.equal(eventDuration(ev({ c: ['market'] }), 44.6), 45);
    assert.equal(eventDuration(ev({ c: ['market'], du: 44.4 })), 44);
  });
});

describe('formatDuration', () => {
  test('renders hours and minutes', () => {
    assert.equal(formatDuration(90), '1h 30m');
    assert.equal(formatDuration(120), '2h');
    assert.equal(formatDuration(45), '45m');
  });
  test('a sub-hour or zero length stays in minutes', () => {
    assert.equal(formatDuration(0), '0m');
    assert.equal(formatDuration(59), '59m');
  });
  test('a whole number of hours drops the minutes', () => {
    assert.equal(formatDuration(60), '1h');
    assert.equal(formatDuration(180), '3h');
  });
});
