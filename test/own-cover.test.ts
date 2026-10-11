// The photograph at the top of an event page is the largest thing on it. It
// comes from our own storage when a copy has been made, and from the site the
// event was found on when it has not.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { ownCover } from '../src/lib/img/own-cover.ts';
import { thumbKey } from '../src/lib/img/thumb-key.ts';

const SOURCE = 'https://www.mentelocale.it/repository/contenuti/horizontal/142197_half.jpg?rand=1';
const LARGE = 'https://www.mentelocale.it/repository/contenuti/horizontal/142197.jpg?rand=1';

describe('ownCover', () => {
  const made = new Set([thumbKey(LARGE)]);
  test('names our copy of the file the page would have fetched', () => {
    assert.equal(ownCover(made)(SOURCE), `/uploads/covers/${thumbKey(LARGE)}.webp`);
  });
  test('a photograph with no copy is left to its source', () => {
    assert.equal(ownCover(made)('https://example.test/other.jpg'), undefined);
  });
  test('a picture that is already ours is not looked up', () => {
    assert.equal(ownCover(new Set([thumbKey('/uploads/a.jpg')]))('/uploads/a.jpg'), undefined);
  });
});
