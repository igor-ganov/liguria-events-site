import { archivedEvents } from '../data/archived-events.ts';
import { archivedSitemapUrls } from '../lib/seo/archived-sitemap-urls.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { sitemapXml } from '../lib/seo/sitemap-xml.ts';
import type { APIRoute } from 'astro';

// Everything this site has published and is no longer advertising in a feed.
// It only grows, and the pages in it are finished, so a crawler that has read
// it once has no reason to read it again — which is the point of it being its
// own file.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const archived = await archivedEvents(EVENTS_URL);
  return new Response(sitemapXml(archivedSitemapUrls(archived, site)), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
