import { cachedEvents } from '../data/cached-events.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { sitemapXml } from '../lib/seo/sitemap-xml.ts';
import { upcomingSitemapUrls } from '../lib/seo/upcoming-sitemap-urls.ts';
import type { APIRoute } from 'astro';

// The part that moves: today's events, gone in a fortnight. Kept apart from
// the archive so a crawler that only takes a hundred URLs a day spends them on
// what is new rather than re-reading two thousand pages that are finished.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const payload = await cachedEvents(EVENTS_URL);
  return new Response(sitemapXml(upcomingSitemapUrls(payload.events, isoToday(), site)), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
