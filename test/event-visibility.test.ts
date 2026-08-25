// The one boolean that separates a private invitation from a public listing.
// Getting it wrong puts somebody's party in a city feed and in Google.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { parseEventInput } from '../src/lib/events/event-input.ts';

const body = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  title: 'Festa',
  description: 'Una festa.',
  startDate: '2026-09-01',
  categories: ['music'],
  ...over,
});

const value = (over: Record<string, unknown> = {}) => {
  const result = parseEventInput(body(over));
  assert.ok(result.ok, `not ok: ${result.ok === false ? result.detail : ''}`);
  return result.value;
};

describe('visibility', () => {
  test('nobody choosing means the private case', () => {
    assert.equal(value().visibility, 'link');
  });

  test('a missing field is not an implicit yes', () => {
    assert.equal(value({ listed: undefined }).visibility, 'link');
  });

  test('only an explicit true asks for the feed', () => {
    assert.equal(value({ listed: true }).visibility, 'public');
    assert.equal(value({ listed: false }).visibility, 'link');
  });

  test('a truthy-looking string does not count — the form sends a boolean', () => {
    // A hand-rolled POST saying listed:"yes" must not reach the city feed.
    assert.equal(value({ listed: 'yes' }).visibility, 'link');
    assert.equal(value({ listed: 1 }).visibility, 'link');
  });
});
