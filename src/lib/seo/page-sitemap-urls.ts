import { citySitemapUrls } from './city-sitemap-urls.ts';
import { doorSitemapUrls } from './door-sitemap-urls.ts';
import { contentSitemapUrls } from './content-sitemap-urls.ts';
import { regionSitemapUrls } from './region-sitemap-urls.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

/**
 * The page tier: the regions, the cities, the calendars and the written pages.
 *
 * This was the last part of the site still advertised by the generated sitemap,
 * and it never got the treatment the hand-written files got in September — 864
 * rows, all three locales of every page, no lastmod, no hreflang, and whichever
 * routes happened to be prerendered. Google last downloaded it on 30 September:
 * with no lastmod there was nothing in it to say anything had changed.
 */
export const pageSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] => [
  ...doorSitemapUrls(events, today, site),
  ...regionSitemapUrls(events, today, site),
  ...citySitemapUrls(events, today, site),
  ...contentSitemapUrls(today, site),
];
