import { isoToday } from '../lib/calendar/iso-today.ts';
import { SITEMAP_PARTS } from '../lib/seo/sitemap-parts.ts';
import { sitemapIndexXml } from '../lib/seo/sitemap-index-xml.ts';
import type { APIRoute } from 'astro';

// Submitted to Search Console on 6 August, when @astrojs/sitemap owned this
// address and wrote an index of one file it generated. The integration is gone
// — a sitemap of everything prerendered is a denylist, and a denylist
// advertises every page nobody remembered to exclude — and the address stays,
// as an index of the three files the site keeps by hand.
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const today = isoToday();
  const origin = site?.origin ?? 'https://dovego.it';
  return new Response(
    sitemapIndexXml(SITEMAP_PARTS.map((part) => ({ loc: `${origin}/${part}`, lastmod: today }))),
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
};
