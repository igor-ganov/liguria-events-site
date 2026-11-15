import { embedQuery } from './embed-query.ts';
import { loadVectorIndex } from './load-vector-index.ts';
import { rankSuggest } from '../rank-suggest.ts';
import { suggestQuery } from './suggest-query.ts';
import type { AssetReader } from './load-vector-index.ts';
import type { SuggestQuery } from './suggest-query.ts';
import type { VectorIndex } from '../vector-index.ts';

/** What the endpoint needs from the worker's environment. */
export type SuggestEnv = Readonly<{ AI: unknown; ASSETS: AssetReader }>;

type Ready = Readonly<{ index: VectorIndex; vector: readonly number[] }>;

// Ten minutes: the same words answer the same way all day, and the corpus
// only changes with a deploy. The browser and the edge both keep it, so a
// query typed again — or by the next reader — costs no model call.
const KEPT = { 'cache-control': 'public, max-age=600' };
const NOT_KEPT = { 'cache-control': 'no-store' };

const ranked = async (env: SuggestEnv, origin: string, query: SuggestQuery, today: string): Promise<Response> => {
  const [index, vector] = await Promise.all([loadVectorIndex(env.ASSETS, origin), embedQuery(env.AI, query.text)]);
  return (
    [{ index, vector }]
      .filter((ready): ready is Ready => ready.index !== undefined && ready.vector !== undefined)
      .map(({ index: found, vector: near }) => Response.json(rankSuggest(found, near, query.region, today), { headers: KEPT }))
      .at(0) ?? new Response(undefined, { status: 503, headers: NOT_KEPT })
  );
};

/**
 * The events and venues of a region nearest a query in meaning, as two id
 * lists. 400 for a query not worth sending (the page never sends one), 503
 * when there is no index or the model fails — the page keeps the suggestions
 * its letters already found, so either is invisible to a reader.
 */
export const answerSuggest = (env: SuggestEnv, url: URL, today: string): Promise<Response> =>
  [suggestQuery(url)]
    .filter((query): query is SuggestQuery => query !== undefined)
    .map((query) => ranked(env, url.origin, query, today))
    .at(0) ?? Promise.resolve(new Response(undefined, { status: 400, headers: NOT_KEPT }));
