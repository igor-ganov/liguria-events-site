/** One line of a sitemap index: where a sitemap is and when it last changed. */
export type SitemapRef = Readonly<{ loc: string; lastmod: string }>;

const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * An index of sitemaps.
 *
 * The site's events used to be one file of seven thousand URLs, rewritten on
 * every deploy — so a crawler with a small appetite was handed the whole thing
 * as one lump and took a sample of it. Split by how often a part actually
 * changes, and the address Google already has submitted becomes this index, so
 * the split arrives without anybody resubmitting anything.
 */
export const sitemapIndexXml = (sitemaps: readonly SitemapRef[]): string =>
  `<?xml version="1.0" encoding="UTF-8"?>` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
  sitemaps
    .map(
      (sitemap) =>
        `<sitemap><loc>${escapeXml(sitemap.loc)}</loc><lastmod>${escapeXml(sitemap.lastmod)}</lastmod></sitemap>`,
    )
    .join('') +
  `</sitemapindex>`;
