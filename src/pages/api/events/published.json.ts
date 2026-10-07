import type { APIRoute } from 'astro';
import { adoptedEvents } from '../../../lib/events/adopted-events.ts';
import { cachedEvents } from '../../../data/cached-events.ts';
import { EVENTS_URL } from '../../../data/events-url.ts';
import { keptByOrganisers } from '../../../lib/events/kept-by-organisers.ts';
import { publishedEvents } from '../../../lib/events/d1-published.ts';

export const prerender = false;

/**
 * What the database knows that a static page does not, in the feed's
 * CompactEvent shape: the events made on the platform, and the crawled events
 * an organiser has taken over, as the organiser keeps them. The corpus is read
 * only when there is one of the second kind to lay over it.
 */
export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime.env.DB;
  const [made, adopted] = await Promise.all([publishedEvents(db), adoptedEvents(db)]);
  const corpus = await Promise.all(adopted.slice(0, 1).map(() => cachedEvents(EVENTS_URL).catch(() => ({ events: [] }))));
  const kept = keptByOrganisers(corpus.at(0)?.events ?? [], adopted);
  return Response.json([...made, ...kept], { headers: { 'cache-control': 'public, max-age=30' } });
};
