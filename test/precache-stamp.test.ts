// The fingerprint that makes a new offline page reach a device at all.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { precacheStamp } from '../src/lib/pwa/precache-stamp.ts';

describe('precacheStamp', () => {
  test('the same files give the same stamp', () => {
    assert.equal(precacheStamp(['a', 'b']), precacheStamp(['a', 'b']));
  });

  test('a changed file gives a different one — which is the whole point', () => {
    assert.notEqual(precacheStamp(['a', 'b']), precacheStamp(['a', 'b!']));
  });

  test('the same bytes split differently are not the same input', () => {
    // Joined with a separator that cannot occur in a source file, so two files
    // "ab" + "c" cannot collide with "a" + "bc".
    assert.notEqual(precacheStamp(['ab', 'c']), precacheStamp(['a', 'bc']));
  });

  test('it is short enough to read in a diff', () => {
    assert.equal(precacheStamp(['a']).length, 8);
  });
});
