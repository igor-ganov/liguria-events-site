import { isoToday } from '../lib/calendar/iso-today.ts';
import { sitemapIndexXml } from '../lib/seo/sitemap-index-xml.ts';
import type { APIRoute } from 'astro';

// This address is what Google has had submitted since August, so it stays — as
// an index of the files it was split into. The split arrives without anybody
// resubmitting anything, and a crawler can learn that the upcoming events move
// daily while the facets do not.
//
// The archive is not in it. 3 345 finished pages were a third of everything we
// advertised, to a crawler that fetches a dozen a day; the file is still served
// for whoever asks, and nothing offers it any more.
export const prerender = true;

const PARTS = ['sitemap-upcoming.xml', 'sitemap-places.xml'];

export const GET: APIRoute = ({ site }) => {
  const today = isoToday();
  const origin = site?.origin ?? 'https://dovego.it';
  return new Response(
    sitemapIndexXml(PARTS.map((part) => ({ loc: `${origin}/${part}`, lastmod: today }))),
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
};
