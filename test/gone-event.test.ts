import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventStatusCode } from '../src/lib/events/event-status-code.ts';

describe('eventStatusCode', () => {
  test('an event we can still resolve is 200, past or not', () => {
    assert.equal(eventStatusCode('4d15a917f0f4', true), 200);
  });

  test('one of our ids that resolves to nothing is Gone, not Not Found', () => {
    // It existed; its record expired. 404 says "never heard of it" and Google
    // keeps such URLs for months — 410 is the one it acts on, and there are
    // 15 806 of them waiting.
    assert.equal(eventStatusCode('1e6b4b74d225', false), 410);
  });

  test('anything not shaped like our id keeps its 404', () => {
    assert.equal(eventStatusCode('zzz', false), 404);
    assert.equal(eventStatusCode('', false), 404);
    assert.equal(eventStatusCode('4d15a917f0f4x', false), 404);
    assert.equal(eventStatusCode('4D15A917F0F4', false), 404); // ids are lowercase
    assert.equal(eventStatusCode('../../etc/passwd', false), 404);
  });
});
