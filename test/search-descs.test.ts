// The search reads an event's description, and used to find it in the page:
// every card carried its whole description, hidden, for a reader who mostly
// never searches. The descriptions now live in a file of their own, one per
// region and language, fetched when the search box is first touched.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { searchDescs } from '../src/lib/events/search-descs.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent>): CompactEvent => ({ id: 'a', t: 'T', s: '2026-11-01', c: [], u: '', rg: 'liguria', ...over });
const text = { en: 'Brass on the pier', it: 'Ottoni sul molo', ru: 'Духовые на пирсе' };

describe('the descriptions a region hands the search', () => {
  test('are keyed by event and in the language asked for', () => {
    assert.deepEqual(searchDescs([event({ id: 'a', d: text })], 'liguria', 'it'), { a: 'Ottoni sul molo' });
  });
  test('are plain text: what the search matches is words, not markup', () => {
    const marked = searchDescs([event({ d: { ...text, en: '## Programme\n**Brass** on the pier' } })], 'liguria', 'en');
    assert.equal(/[#*]/.test(marked['a'] ?? ''), false);
    assert.ok((marked['a'] ?? '').includes('Brass'));
  });
  test('leave out an event with nothing written about it', () => {
    assert.deepEqual(searchDescs([event({ id: 'a' }), event({ id: 'b', d: text })], 'liguria', 'en'), { b: 'Brass on the pier' });
  });
  test('leave out the events of other regions', () => {
    assert.deepEqual(searchDescs([event({ id: 'a', d: text }), event({ id: 'b', d: text, rg: 'lazio' })], 'liguria', 'en'), { a: 'Brass on the pier' });
  });
});
