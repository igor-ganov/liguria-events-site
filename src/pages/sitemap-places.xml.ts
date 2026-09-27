import { cachedEvents } from '../data/cached-events.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { facetSitemapUrls } from '../lib/seo/facet-sitemap-urls.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { sitemapXml } from '../lib/seo/sitemap-xml.ts';
import type { APIRoute } from 'astro';

// A city's today, tomorrow, weekend and free things: server-rendered, so the
// generated sitemap cannot see them, and steady enough to be worth their own
// file.
//
// The venue pages used to be here, 2 553 of them. URL Inspection, sampled over
// a fortnight: none indexed, none even fetched — while the region pages Google
// does read sat behind them in the same queue. They stay reachable and linked;
// they are no longer advertised. Re-offer them when a venue page says something
// a city page does not.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const payload = await cachedEvents(EVENTS_URL);
  return new Response(sitemapXml(facetSitemapUrls(payload.events, isoToday(), site)), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
