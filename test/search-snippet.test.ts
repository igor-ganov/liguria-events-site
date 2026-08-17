import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { findAll } from '../src/lib/search/find-all.ts';
import { wordEdge } from '../src/lib/search/word-edge.ts';
import { quoteAround } from '../src/lib/search/quote-around.ts';
import { termForms } from '../src/lib/search/term-forms.ts';
import { buildSnippet } from '../src/lib/search/snippet.ts';
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

const PADDING = 'lorem ipsum '.repeat(30);

describe('findAll', () => {
  test('every occurrence, in order, as ranges', () => {
    assert.deepEqual(findAll('a b a', 'a'), [
      { start: 0, end: 1 },
      { start: 4, end: 5 },
    ]);
  });

  test('no occurrence is no ranges', () => {
    assert.deepEqual(findAll('a b a', 'z'), []);
  });

  test('overlapping runs are consumed, not double-counted', () => {
    assert.deepEqual(findAll('aaaa', 'aa'), [
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]);
  });
});

describe('wordEdge', () => {
  test('forward stops at the next space, back at the previous one', () => {
    assert.equal(wordEdge('hello world again', 5, true), 5);
    assert.equal(wordEdge('hello world again', 7, true), 11);
    assert.equal(wordEdge('hello world again', 7, false), 5);
  });

  test('with no space that way, the edge is the end of the text', () => {
    assert.equal(wordEdge('hello', 2, true), 5);
    assert.equal(wordEdge('hello', 2, false), 0);
  });
});

describe('quoteAround', () => {
  test('with no hits it quotes the opening and marks nothing', () => {
    const snippet = quoteAround(`  ${PADDING}`, []);
    assert.equal(snippet.marks.length, 0);
    assert.equal(snippet.text.length, 180 - 2);
    assert.ok(snippet.text.startsWith('lorem'));
  });

  test('a short source is quoted whole, with the hit kept where it is', () => {
    const snippet = quoteAround('one two three', [{ start: 4, end: 7 }]);
    assert.equal(snippet.text, 'one two three');
    assert.deepEqual(snippet.marks, [{ start: 4, end: 7 }]);
  });

  test('a hit deep in a long text is quoted with its surroundings, re-based', () => {
    const source = `${PADDING}festival ${PADDING}`;
    const at = source.indexOf('festival');
    const snippet = quoteAround(source, [{ start: at, end: at + 8 }]);
    const mark = snippet.marks[0]!;
    assert.equal(snippet.text.slice(mark.start, mark.end), 'festival');
    assert.ok(snippet.text.length < source.length);
    assert.ok(!snippet.text.startsWith(' '));
  });

  test('hits that fall outside the quote are dropped', () => {
    const source = `festival ${PADDING}festival`;
    const first = source.indexOf('festival');
    const last = source.lastIndexOf('festival');
    const snippet = quoteAround(source, [
      { start: first, end: first + 8 },
      { start: last, end: last + 8 },
    ]);
    assert.equal(snippet.marks.length, 1);
    assert.equal(snippet.text.slice(0, 8), 'festival');
  });
});

describe('termForms', () => {
  test('a term the document spells verbatim is its own only form', () => {
    assert.deepEqual(termForms(doc({ body: 'the festival of science' }), ['festival']), ['festival']);
  });

  test('a misspelled term resolves to the tokens near it', () => {
    const forms = termForms(doc({ body: 'the festival of science' }), ['festivl']);
    assert.ok(forms.includes('festival'));
  });

  test('a term too short to blur, and absent, has no form at all', () => {
    assert.deepEqual(termForms(doc({ body: 'the festival' }), ['abc']), []);
  });

  test('several terms contribute their forms in order', () => {
    const forms = termForms(doc({ body: 'jazz in genova' }), ['jazz', 'genova']);
    assert.deepEqual(forms, ['jazz', 'genova']);
  });
});

describe('buildSnippet', () => {
  test('quotes the body around the term, marking exactly the match', () => {
    const source = `${PADDING}Festival della Scienza ${PADDING}`;
    const snippet = buildSnippet(doc({ body: source }), ['festival']);
    const mark = snippet.marks[0]!;
    assert.equal(snippet.text.slice(mark.start, mark.end), 'Festival');
    assert.ok(snippet.text.includes('della Scienza'));
  });

  test('a body-less document is quoted from its description', () => {
    const snippet = buildSnippet(doc({ body: '   ', description: 'Concert in Genova' }), ['genova']);
    const mark = snippet.marks[0]!;
    assert.equal(snippet.text, 'Concert in Genova');
    assert.equal(snippet.text.slice(mark.start, mark.end), 'Genova');
  });

  test('a term that is nowhere leaves the opening quoted and unmarked', () => {
    const snippet = buildSnippet(doc({ body: 'Concert in Genova' }), ['motorbike']);
    assert.deepEqual(snippet, { text: 'Concert in Genova', marks: [] });
  });

  test('accents and case in the source do not move the marks', () => {
    const snippet = buildSnippet(doc({ body: 'Caffè Genovese' }), ['caffe']);
    const mark = snippet.marks[0]!;
    assert.equal(snippet.text.slice(mark.start, mark.end), 'Caffè');
  });
});
