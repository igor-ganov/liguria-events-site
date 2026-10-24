import { monthsAhead } from '../calendar/months-ahead.ts';
import { sitemapRow } from './sitemap-row.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

// The pages that name no region: the front door that asks, and the country's
// own map, which used to be a redirect into a guessed region.
//
// The calendar door is deliberately absent. It renders this month and declares
// that month's address as its canonical, and the month has a row of its own
// below — so advertising the door spends a fetch to be told to fetch again.
// Googlebot manages 629 fetches a day for the whole site.
const DOORS = ['', 'map/'];

/**
 * The national pages, advertised for the first time.
 *
 * They could not be before: every one of them answered 302, and the site's
 * strongest address has sat in Google's index as a redirect since the site
 * began — crawled on 13 July, never since, and named as the x-default of every
 * page's hreflang cluster while `/it/` answered 404. A redirect is not a page
 * anybody can be shown in a result.
 *
 * The months come with it, and only the ones still to come: a national
 * `/calendar/2026-09/` is as finished as a region's.
 */
export const doorSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] => [
  ...DOORS.map((path) => sitemapRow(path, today, site)),
  ...monthsAhead(events, today).map((month) => sitemapRow(`calendar/${month}/`, today, site)),
];
