import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { fieldScore } from '../src/lib/search/field-score.ts';
import { fuzzyScore } from '../src/lib/search/fuzzy-score.ts';
import { scoreTerm } from '../src/lib/search/score-term.ts';
import { scoreDoc } from '../src/lib/search/score.ts';
import { prepare } from '../src/lib/search/prepared.ts';
import type { PreparedDoc } from '../src/lib/search/prepared.ts';
import type { SearchDoc } from '../src/lib/search/doc.ts';

const doc = (fields: Partial<SearchDoc>): PreparedDoc => {
  const full: SearchDoc = {
    id: '1',
    lang: 'en',
    section: 'event',
    url: '/x',
    title: '',
    description: '',
    body: '',
    ...fields,
  };
  return prepare({ lang: 'en', docs: [full] }).docs[0]!;
};

describe('fieldScore', () => {
  test('a whole-word hit is worth the full weight, anywhere in the field', () => {
    assert.equal(fieldScore('festival of light', 'festival', 10), 10);
    assert.equal(fieldScore('the big festival', 'festival', 10), 10);
    assert.equal(fieldScore('the festival tonight', 'festival', 4), 4);
  });

  test('a hit buried inside a longer word is worth less', () => {
    assert.equal(fieldScore('the festivals here', 'festival', 10), 6);
    assert.equal(fieldScore('antifestival', 'festival', 10), 6);
  });

  test('an absent term scores nothing', () => {
    assert.equal(fieldScore('festival of light', 'concert', 10), 0);
    assert.equal(fieldScore('', 'concert', 10), 0);
  });
});

describe('fuzzyScore', () => {
  test('a term too short to blur never scores', () => {
    assert.equal(fuzzyScore(doc({ title: 'Abc' }), 'abd'), 0);
  });

  test('a misspelling of a token in the document scores, but modestly', () => {
    const scored = fuzzyScore(doc({ title: 'Festival della Scienza' }), 'festivl');
    assert.ok(scored > 0);
    assert.ok(scored < 1);
  });

  test('a word the document does not contain at all scores nothing', () => {
    assert.equal(fuzzyScore(doc({ title: 'Festival della Scienza' }), 'motorbike'), 0);
  });
});

describe('scoreTerm', () => {
  test('a title hit outranks a description hit, which outranks a body hit', () => {
    const inTitle = scoreTerm(doc({ title: 'Jazz night' }), 'jazz');
    const inDescription = scoreTerm(doc({ description: 'Jazz night' }), 'jazz');
    const inBody = scoreTerm(doc({ body: 'Jazz night' }), 'jazz');
    assert.equal(inTitle, 10);
    assert.equal(inDescription, 4);
    assert.equal(inBody, 2);
    assert.ok(inTitle > inDescription && inDescription > inBody);
  });

  test('hits in several fields add up', () => {
    assert.equal(scoreTerm(doc({ title: 'Jazz', body: 'jazz' }), 'jazz'), 12);
  });

  test('a fuzzy hit never outranks anything spelled right', () => {
    const fuzzy = scoreTerm(doc({ title: 'Festival della Scienza' }), 'festivl');
    const exact = scoreTerm(doc({ body: 'festival' }), 'festival');
    assert.ok(fuzzy > 0);
    assert.ok(fuzzy < exact);
  });

  test('a term that is nowhere, verbatim or near, scores nothing', () => {
    assert.equal(scoreTerm(doc({ title: 'Jazz night' }), 'motorbike'), 0);
  });
});

describe('scoreDoc', () => {
  test('every term must land: the scores of a full match add up', () => {
    const d = doc({ title: 'Jazz night', body: 'in genova' });
    assert.equal(scoreDoc(d, ['jazz', 'genova']), 12);
  });

  test('one missing term drops the document, whatever the others scored', () => {
    const d = doc({ title: 'Jazz night', body: 'in genova' });
    assert.equal(scoreDoc(d, ['jazz', 'motorbike']), 0);
    assert.equal(scoreDoc(d, ['motorbike', 'jazz']), 0);
  });

  test('an empty query scores nothing', () => {
    assert.equal(scoreDoc(doc({ title: 'Jazz night' }), []), 0);
  });
});
