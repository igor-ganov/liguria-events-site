import { alternateLinks } from './alternate-links.ts';
import { pageCanonical } from './page-canonical.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { LOCALES } from '../i18n/locales.ts';
import type { Locale } from '../i18n/locales.ts';
import type { SitemapUrl } from './sitemap-url.ts';

/**
 * One sitemap entry for a page: the language the site speaks, when it last
 * changed, and the languages it also exists in.
 *
 * One row per page rather than one per locale — three locs for one page made it
 * compete with itself for a crawl budget of a few hundred fetches a day, and
 * the hreflang alternates inside the row are the part Google reads.
 */
export const sitemapRow = (
  path: string,
  lastmod: string,
  site: URL | undefined,
  locales: readonly Locale[] = LOCALES,
): SitemapUrl => ({
  // The language the site speaks, when the page is in a language at all: a page
  // with none is advertised at the one address it answers from, the same rule
  // alternateLinks applies to the rows it does not draw.
  loc: pageCanonical(
    locales.find((locale) => locale === ENTRY_LOCALE) ?? locales[0] ?? ENTRY_LOCALE,
    path,
    site,
    locales,
  ),
  lastmod,
  alternates: alternateLinks(path, site, locales),
});
