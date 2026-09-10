import { archivedEvents } from '../data/archived-events.ts';
import { archivedSitemapUrls } from '../lib/seo/archived-sitemap-urls.ts';
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
  const today = isoToday();
  // The archive belongs here for the same reason the upcoming events do: these
  // pages exist and resolve, and a crawler keeps only what it is still offered.
  const archived = await archivedEvents(EVENTS_URL);
  return new Response(
    sitemapXml([
      ...eventSitemapUrls(payload.events, today, site),
      ...archivedSitemapUrls(archived, site),
    ]),
    {
      headers: { 'content-type': 'application/xml; charset=utf-8' },
    },
  );
};
