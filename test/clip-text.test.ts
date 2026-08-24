// A link preview shows about two lines. An event's body copy is 700 characters,
// so the meta description was the whole article — unreadable in every client
// that renders it (R1.4).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { clipText } from '../src/lib/seo/clip-text.ts';

describe('clipText', () => {
  test('leaves anything already short enough alone', () => {
    assert.equal(clipText('Two lines is plenty.', 200), 'Two lines is plenty.');
  });

  test('cuts at the last word boundary and marks the cut', () => {
    assert.equal(clipText('alpha beta gamma delta', 16), 'alpha beta…');
  });

  test('falls back to a hard cut when there is no boundary to find', () => {
    assert.equal(clipText('a'.repeat(40), 10), `${'a'.repeat(10)}…`);
  });

  test('collapses the whitespace a scraped article arrives with', () => {
    assert.equal(clipText('one\n\n  two\tthree', 200), 'one two three');
  });

  test('an empty description stays empty rather than becoming an ellipsis', () => {
    assert.equal(clipText('', 200), '');
    assert.equal(clipText('   \n ', 200), '');
  });
});
