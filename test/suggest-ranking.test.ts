// Suggestions merge two rankings — the letters typed (lexical) and the meaning
// (semantic) — and show them in two groups. These are the pure steps of that.
import { describe, expect, test } from 'bun:test';
import { fuseRanks } from '../src/lib/suggest/fuse-ranks.ts';
import { groupSuggestions } from '../src/lib/suggest/group-suggestions.ts';
import { mergeSuggestions } from '../src/lib/suggest/merge-suggestions.ts';
import type { SuggestDoc } from '../src/lib/suggest/suggest-doc.ts';

const pair = (one: SuggestDoc): [string, SuggestDoc] => [one.id, one];

const doc = (id: string, kind: SuggestDoc['kind'] = 'event'): SuggestDoc => ({
  id, kind, title: id, sub: '', path: `event/${id}/`, body: '', until: '',
});

describe('fuseRanks', () => {
  test('an id both rankings agree on comes before ids only one of them found', () => {
    expect(fuseRanks([['a', 'b', 'c'], ['x', 'b', 'y']])[0]).toBe('b');
  });
  test('every id appears once, whichever ranking found it', () => {
    expect([...fuseRanks([['a', 'b'], ['b', 'c']])].sort()).toEqual(['a', 'b', 'c']);
  });
  test('a tie goes to the ranking given first', () => {
    expect(fuseRanks([['lex'], ['sem']])).toEqual(['lex', 'sem']);
  });
  test('one ranking alone keeps its order', () => {
    expect(fuseRanks([['c', 'a', 'b'], []])).toEqual(['c', 'a', 'b']);
  });
});

describe('groupSuggestions', () => {
  const docs = new Map(['e1', 'e2', 'e3', 'e4', 'e5', 'e6'].map((id) => pair(doc(id))));
  const venues = new Map(['v1', 'v2', 'v3', 'v4'].map((id) => pair(doc(id, 'venue'))));
  const all = new Map([...docs, ...venues]);

  test('splits one ranking into events and venues, keeping the order', () => {
    const groups = groupSuggestions(all, ['v2', 'e3', 'e1', 'v1']);
    expect(groups.events.map((one) => one.id)).toEqual(['e3', 'e1']);
    expect(groups.venues.map((one) => one.id)).toEqual(['v2', 'v1']);
  });
  test('shows at most five events and three venues', () => {
    const groups = groupSuggestions(all, [...docs.keys(), ...venues.keys()]);
    expect(groups.events).toHaveLength(5);
    expect(groups.venues).toHaveLength(3);
  });
  test('an id the page does not know is dropped, not shown blank', () => {
    expect(groupSuggestions(all, ['gone', 'e2']).events.map((one) => one.id)).toEqual(['e2']);
  });
});

describe('mergeSuggestions', () => {
  const all = new Map([doc('jazz-night'), doc('piano'), doc('kids'), doc('club', 'venue'), doc('hall', 'venue')].map(pair));

  test('without the meaning (offline, failed) the letters alone decide', () => {
    const groups = mergeSuggestions(all, ['jazz-night'], undefined);
    expect(groups.events.map((one) => one.id)).toEqual(['jazz-night']);
    expect(groups.venues).toEqual([]);
  });
  test('the meaning adds what no letter matched, in both groups', () => {
    const groups = mergeSuggestions(all, ['jazz-night'], { events: ['piano', 'jazz-night'], venues: ['club'] });
    expect(groups.events.map((one) => one.id)).toEqual(['jazz-night', 'piano']);
    expect(groups.venues.map((one) => one.id)).toEqual(['club']);
  });
  test('the meaning alone still fills both groups', () => {
    const groups = mergeSuggestions(all, [], { events: ['kids'], venues: ['hall', 'club'] });
    expect(groups.events.map((one) => one.id)).toEqual(['kids']);
    expect(groups.venues.map((one) => one.id)).toEqual(['hall', 'club']);
  });
});
