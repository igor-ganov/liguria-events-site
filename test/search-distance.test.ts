import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { maxEditsFor } from '../src/lib/search/max-edits-for.ts';
import { editDistanceWithin } from '../src/lib/search/edit-distance-within.ts';
import { prefixDistanceWithin } from '../src/lib/search/prefix-distance-within.ts';

describe('maxEditsFor', () => {
  test('no budget at all for a word of three letters or fewer', () => {
    assert.equal(maxEditsFor(''), 0);
    assert.equal(maxEditsFor('a'), 0);
    assert.equal(maxEditsFor('abc'), 0);
  });

  test('the budget grows at each length boundary', () => {
    assert.equal(maxEditsFor('abcd'), 1);
    assert.equal(maxEditsFor('abcdef'), 1);
    assert.equal(maxEditsFor('abcdefg'), 2);
    assert.equal(maxEditsFor('abcdefghi'), 2);
    assert.equal(maxEditsFor('abcdefghij'), 3);
    assert.equal(maxEditsFor('a'.repeat(40)), 3);
  });
});

describe('editDistanceWithin', () => {
  test('identical words cost nothing, even with no budget', () => {
    assert.equal(editDistanceWithin('genova', 'genova', 0), 0);
    assert.equal(editDistanceWithin('', '', 0), 0);
  });

  test('one substitution, one insertion, one deletion each cost one', () => {
    assert.equal(editDistanceWithin('genova', 'genoya', 1), 1);
    assert.equal(editDistanceWithin('genova', 'genovaa', 1), 1);
    assert.equal(editDistanceWithin('genova', 'genva', 1), 1);
  });

  test('the classic three-edit pair is found only when the budget allows it', () => {
    assert.equal(editDistanceWithin('kitten', 'sitting', 3), 3);
    assert.equal(editDistanceWithin('kitten', 'sitting', 2), undefined);
  });

  test('a length gap wider than the budget is rejected outright', () => {
    assert.equal(editDistanceWithin('abc', 'abcdef', 2), undefined);
    assert.equal(editDistanceWithin('ab', '', 1), undefined);
  });

  test('an empty word costs the other word its length', () => {
    assert.equal(editDistanceWithin('', 'ab', 2), 2);
  });

  test('unrelated words of equal length exceed the bound', () => {
    assert.equal(editDistanceWithin('genova', 'milano', 2), undefined);
    assert.ok((editDistanceWithin('genova', 'milano', 6) ?? 0) > 2);
  });
});

describe('prefixDistanceWithin', () => {
  test('a term that is a prefix of the token matches exactly', () => {
    assert.equal(prefixDistanceWithin('gen', 'genova', 0), 0);
    assert.equal(prefixDistanceWithin('genova', 'genova', 1), 0);
  });

  test('an inflected ending diverges for free, the stem still has to match', () => {
    assert.equal(prefixDistanceWithin('museo', 'musei', 1), 1);
    assert.equal(prefixDistanceWithin('festival', 'festivalissimo', 1), 0);
  });

  test('the first two letters are an anchor — a typo there is not a match', () => {
    assert.equal(prefixDistanceWithin('genova', 'xenova', 3), undefined);
    assert.equal(prefixDistanceWithin('g', 'genova', 0), 0);
  });

  test('a token further away than the budget is not a match', () => {
    assert.equal(prefixDistanceWithin('genova', 'geometria', 1), undefined);
  });

  test('a shorter token than the term still matches within budget', () => {
    assert.equal(prefixDistanceWithin('genova', 'genov', 1), 1);
  });
});
