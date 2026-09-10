import { cachedEvents } from '../data/cached-events.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { placeSitemapUrls } from '../lib/seo/place-sitemap-urls.ts';
import { sitemapXml } from '../lib/seo/sitemap-xml.ts';
import type { APIRoute } from 'astro';

// Venues and city facets: server-rendered, so the generated sitemap cannot see
// them, and steady enough to be worth their own file.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const payload = await cachedEvents(EVENTS_URL);
  return new Response(sitemapXml(placeSitemapUrls(payload.events, isoToday(), site)), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
