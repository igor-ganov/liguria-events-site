import { cachedEvents } from '../data/cached-events.ts';
import { eventSitemapUrls } from '../lib/seo/event-sitemap-urls.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { sitemapXml } from '../lib/seo/sitemap-xml.ts';
import type { APIRoute } from 'astro';

// A sitemap of its own, emitted at build time and announced from robots.txt
// beside the generated one: @astrojs/sitemap walks the prerendered routes, and
// event pages are deliberately server-rendered, so they can only get in here.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const payload = await cachedEvents(EVENTS_URL);
  return new Response(sitemapXml(eventSitemapUrls(payload.events, isoToday(), site)), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
