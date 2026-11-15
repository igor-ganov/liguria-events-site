import { answerSuggest } from '../../lib/suggest/server/answer-suggest.ts';
import { edgeCached } from '../../lib/suggest/server/edge-cached.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { suggestQuery } from '../../lib/suggest/server/suggest-query.ts';
import type { APIRoute } from 'astro';

export const prerender = false;

/** Search suggestions by meaning: see answerSuggest. Kept at the edge under
 *  the normalised query, so a repeated query costs no model call. */
export const GET: APIRoute = ({ request, locals }) => {
  const url = new URL(request.url);
  const query = suggestQuery(url);
  const key = `${url.origin}/api/suggest?rg=${query?.region ?? ''}&q=${encodeURIComponent(query?.text ?? '')}`;
  return edgeCached(key, () => answerSuggest(locals.runtime.env, url, isoToday()), (work) => locals.runtime.ctx.waitUntil(work));
};
