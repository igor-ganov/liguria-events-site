import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { normalize } from '../src/lib/search/normalize.ts';
import { tokenize } from '../src/lib/search/tokenize.ts';

// The index and the query must agree on the alphabet, so these two are the
// contract every other search module is built on.
describe('normalize', () => {
  test('lower-cases and strips diacritics', () => {
    assert.equal(normalize('Genovà CAFFÈ'), 'genova caffe');
  });

  test('collapses runs of separators and trims the edges', () => {
    assert.equal(normalize('  a   b  '), 'a b');
  });

  test('text with no letters or digits folds to nothing', () => {
    assert.equal(normalize('!!! ???'), '');
  });
});

describe('tokenize', () => {
  test('splits normalised text into words in order', () => {
    assert.deepEqual(tokenize('Festa della Musica'), ['festa', 'della', 'musica']);
  });

  test('an empty query yields no terms rather than one empty term', () => {
    assert.deepEqual(tokenize(''), []);
  });

  test('punctuation-only text yields no terms', () => {
    assert.deepEqual(tokenize('—  •  !'), []);
  });

  test('surrounding whitespace never becomes a term', () => {
    assert.deepEqual(tokenize('   jazz   '), ['jazz']);
  });

  test('digits are searchable words', () => {
    assert.deepEqual(tokenize('Palazzo 2026'), ['palazzo', '2026']);
  });
});
