import type { APIRoute } from 'astro';
import { publishedEvents } from '../../../lib/events/d1-published.ts';

export const prerender = false;

/** Published, user/crawler events from D1 in the feed's CompactEvent shape. */
export const GET: APIRoute = async ({ locals }) => {
  const events = await publishedEvents(locals.runtime.env.DB);
  return Response.json(events, { headers: { 'cache-control': 'public, max-age=30' } });
};
