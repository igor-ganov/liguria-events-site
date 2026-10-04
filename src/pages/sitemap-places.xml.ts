import { cachedEvents } from '../data/cached-events.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { facetSitemapUrls } from '../lib/seo/facet-sitemap-urls.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { sitemapXml } from '../lib/seo/sitemap-xml.ts';
import { venueSitemapUrls } from '../lib/seo/venue-sitemap-urls.ts';
import type { APIRoute } from 'astro';

// A city's today, tomorrow, weekend and free things: server-rendered, so the
// generated sitemap cannot see them, and steady enough to be worth their own
// file.
//
// The venue pages left this file on 2026-09-27: 2 553 URLs, none indexed, none
// even fetched. They are back, bounded — the ones with three events or more,
// now that the page carries the town in its title, Place markup with its
// programme, and a link from its city. Around a hundred pages, which is a bet
// the coverage numbers can settle in a month.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const payload = await cachedEvents(EVENTS_URL);
  const today = isoToday();
  return new Response(
    sitemapXml([
      ...facetSitemapUrls(payload.events, today, site),
      ...venueSitemapUrls(payload.events, today, site),
    ]),
    {
      headers: { 'content-type': 'application/xml; charset=utf-8' },
    },
  );
};
