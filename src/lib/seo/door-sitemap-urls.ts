import { sitemapRow } from './sitemap-row.ts';
import type { SitemapUrl } from './sitemap-url.ts';

// The front doors: the page itself, the country's calendar and its map. They
// name no region because the reader has not named one — these are the pages
// that ask.
const DOORS = ['', 'calendar/', 'map/'];

/**
 * The front doors, advertised for the first time.
 *
 * They could not be before: every one of them answered 302, and the site's own
 * strongest address has sat in Google's index as a redirect since the site
 * began — crawled on 13 July, never since, and named as the x-default of every
 * page's hreflang cluster while `/it/` answered 404. A redirect is not a page
 * anybody can be shown in a result.
 */
export const doorSitemapUrls = (today: string, site: URL | undefined): readonly SitemapUrl[] =>
  DOORS.map((path) => sitemapRow(path, today, site));
