// The worker side of suggestions by meaning: what it accepts, what it reads,
// and that every way it can fail is a quiet 4xx/5xx the page falls back from.
import { describe, expect, test } from 'bun:test';
import { answerSuggest } from '../src/lib/suggest/server/answer-suggest.ts';
import { embedQuery } from '../src/lib/suggest/server/embed-query.ts';
import { parseVectorIndex } from '../src/lib/suggest/server/parse-vector-index.ts';
import { suggestQuery } from '../src/lib/suggest/server/suggest-query.ts';
import { quantize } from '../src/lib/suggest/quantize.ts';
import type { SuggestEnv } from '../src/lib/suggest/server/answer-suggest.ts';

const TODAY = '2026-11-15';
const META = {
  model: '@cf/baai/bge-m3',
  dims: 3,
  ids: ['jazz', 'venue:liguria/genova/louisiana-jazz-club', 'market'],
  regions: ['liguria', 'liguria', 'liguria'],
  until: ['2026-11-20', '', '2026-11-20'],
};
const ROWS = new Int8Array([...quantize([1, 0, 0]), ...quantize([0.9, 0.3, 0]), ...quantize([0, 0, 1])]);

const SERVED: Readonly<Record<string, () => Response>> = {
  'https://dovego.it/data/suggest-index.json': () => Response.json(META),
  'https://dovego.it/data/suggest-vectors.bin': () => new Response(ROWS.slice().buffer),
};
const assets = (served: boolean): SuggestEnv['ASSETS'] => ({
  fetch: async (url) => [SERVED[url]].filter(() => served).map((make) => make?.() ?? new Response('', { status: 404 })).at(0) ?? new Response('', { status: 404 }),
});
const ai = (vector: readonly number[]) => ({ run: async () => ({ shape: [1, vector.length], data: [vector] }) });
const failing = { run: async () => Promise.reject(new Error('model down')) };
const url = (q: string, rg = 'liguria'): URL => new URL(`https://dovego.it/api/suggest?rg=${rg}&q=${encodeURIComponent(q)}`);

describe('suggestQuery', () => {
  test('normalises what was typed, so one cache entry answers every spelling of it', () => {
    expect(suggestQuery(url('  Jazz   Tonight '))).toEqual({ text: 'jazz tonight', region: 'liguria' });
  });
  test('too short, too long or without a region is not worth a model call', () => {
    expect(suggestQuery(url('ja'))).toBeUndefined();
    expect(suggestQuery(url('x'.repeat(81)))).toBeUndefined();
    expect(suggestQuery(url('jazz', ''))).toBeUndefined();
    expect(suggestQuery(url('jazz', '../x'))).toBeUndefined();
  });
});

describe('parseVectorIndex', () => {
  test('reads the ids and the int8 rows the build wrote', () => {
    expect(parseVectorIndex(META, ROWS.slice().buffer)?.ids).toEqual(META.ids);
  });
  test('rows that do not add up to the ids are no index', () => {
    expect(parseVectorIndex(META, new Int8Array(5).buffer)).toBeUndefined();
    expect(parseVectorIndex({ dims: 3 }, ROWS.slice().buffer)).toBeUndefined();
  });
});

describe('embedQuery', () => {
  test('the vector of the one text sent', async () => {
    expect(await embedQuery(ai([0.1, 0.2]), 'jazz')).toEqual([0.1, 0.2]);
  });
  test('no binding, a failing model or a strange answer is no vector', async () => {
    expect(await embedQuery(undefined, 'jazz')).toBeUndefined();
    expect(await embedQuery(failing, 'jazz')).toBeUndefined();
    expect(await embedQuery({ run: async () => ({ data: 'x' }) }, 'jazz')).toBeUndefined();
  });
});

describe('answerSuggest', () => {
  // Order matters: the index is kept per isolate once read, a failed read is not.
  test('no index built is a 503 the page falls back from', async () => {
    expect((await answerSuggest({ AI: ai([1, 0, 0]), ASSETS: assets(false) }, url('jazz'), TODAY)).status).toBe(503);
  });
  test('a query is answered with event and venue ids, kept for ten minutes', async () => {
    const answer = await answerSuggest({ AI: ai([1, 0.05, 0]), ASSETS: assets(true) }, url('jazz live'), TODAY);
    expect(answer.status).toBe(200);
    expect(answer.headers.get('cache-control')).toBe('public, max-age=600');
    expect(await answer.json()).toEqual({ events: ['jazz'], venues: ['venue:liguria/genova/louisiana-jazz-club'] });
  });
  test('a failing model is a 503, never cached', async () => {
    const answer = await answerSuggest({ AI: failing, ASSETS: assets(true) }, url('jazz'), TODAY);
    expect(answer.status).toBe(503);
    expect(answer.headers.get('cache-control')).toBe('no-store');
  });
  test('a query not worth sending is a 400', async () => {
    expect((await answerSuggest({ AI: ai([1, 0, 0]), ASSETS: assets(true) }, url('j'), TODAY)).status).toBe(400);
  });
});
