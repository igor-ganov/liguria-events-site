// The semantic side: document vectors are stored as int8 and ranked by cosine
// against the query's vector, inside the worker.
import { describe, expect, test } from 'bun:test';
import { quantize } from '../src/lib/suggest/quantize.ts';
import { vectorNorms } from '../src/lib/suggest/vector-norms.ts';
import { topMatches } from '../src/lib/suggest/top-matches.ts';
import { rankSuggest } from '../src/lib/suggest/rank-suggest.ts';
import type { VectorIndex } from '../src/lib/suggest/vector-index.ts';

const indexOf = (rows: readonly (readonly [string, string, string, readonly number[]])[]): VectorIndex => {
  const vectors = new Int8Array(rows.flatMap(([, , , vector]) => [...quantize(vector)]));
  return {
    dims: rows[0]?.[3].length ?? 0,
    ids: rows.map(([id]) => id),
    regions: rows.map(([, region]) => region),
    until: rows.map(([, , until]) => until),
    vectors,
    norms: vectorNorms(vectors, rows[0]?.[3].length ?? 0),
  };
};

describe('quantize', () => {
  test('keeps the direction in int8, the largest component at ±127', () => {
    expect([...quantize([0.5, -1, 0.25])]).toEqual([64, -127, 32]);
  });
  test('a zero vector stays zero rather than dividing by it', () => {
    expect([...quantize([0, 0])]).toEqual([0, 0]);
  });
});

describe('topMatches', () => {
  const index = indexOf([
    ['north', 'liguria', '', [1, 0, 0]],
    ['east', 'liguria', '', [0, 1, 0]],
    ['north-east', 'liguria', '', [0.7, 0.7, 0]],
  ]);
  test('ranks by cosine, best first, with the score', () => {
    const found = topMatches(index, [1, 0.1, 0], () => true, 3);
    expect(found.map((one) => one.id)).toEqual(['north', 'north-east', 'east']);
    expect(found[0]?.score ?? 0).toBeGreaterThan(0.99);
  });
  test('skips what the filter rejects and stops at the limit', () => {
    expect(topMatches(index, [1, 0, 0], (at) => at !== 0, 1).map((one) => one.id)).toEqual(['north-east']);
  });
});

describe('rankSuggest', () => {
  const index = indexOf([
    ['jazz', 'liguria', '2026-11-20', [1, 0, 0]],
    ['jazz-past', 'liguria', '2026-11-01', [1, 0, 0]],
    ['jazz-milan', 'lombardia', '2026-11-20', [1, 0, 0]],
    ['venue:liguria/genova/louisiana-jazz-club', 'liguria', '', [0.9, 0.3, 0]],
    ['unrelated', 'liguria', '2026-11-20', [0, 0, 1]],
  ]);
  const found = rankSuggest(index, [1, 0.05, 0], 'liguria', '2026-11-15');

  test('events and venues come back apart, ranked', () => {
    expect(found.events).toEqual(['jazz']);
    expect(found.venues).toEqual(['venue:liguria/genova/louisiana-jazz-club']);
  });
  test('nothing over, nothing from another region, nothing far in meaning', () => {
    ['jazz-past', 'jazz-milan', 'unrelated'].forEach((id) => expect(found.events).not.toContain(id));
  });
});
