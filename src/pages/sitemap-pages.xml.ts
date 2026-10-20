import { cachedEvents } from '../data/cached-events.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { pageSitemapUrls } from '../lib/seo/page-sitemap-urls.ts';
import { sitemapXml } from '../lib/seo/sitemap-xml.ts';
import type { APIRoute } from 'astro';

// The page tier: regions, cities, calendars and the written pages. It used to
// be @astrojs/sitemap's sitemap-0.xml — 864 rows, three locales of each page,
// no lastmod, no hreflang, and whatever route happened to be prerendered,
// including the ones behind the session gate. Google last downloaded that file
// on 30 September; nothing in it said anything had changed.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const payload = await cachedEvents(EVENTS_URL);
  return new Response(sitemapXml(pageSitemapUrls(payload.events, isoToday(), site)), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
