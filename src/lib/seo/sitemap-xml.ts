import type { SitemapUrl } from './event-sitemap-urls.ts';

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Every language version lists all of them, itself included — the shape Google
// asks for, and the one that stops the three locales competing with each other.
const alternatesOf = (url: SitemapUrl): string =>
  url.alternates
    .map(
      (alt) =>
        `<xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>`,
    )
    .join('');

const urlOf = (url: SitemapUrl): string =>
  `<url><loc>${escapeXml(url.loc)}</loc><lastmod>${escapeXml(url.lastmod)}</lastmod>${alternatesOf(url)}</url>`;

/** A sitemap document with hreflang alternates, ready to serve. */
export const sitemapXml = (urls: readonly SitemapUrl[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
  urls.map(urlOf).join('') +
  `</urlset>`;
