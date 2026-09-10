import { alternateLinks } from './alternate-links.ts';
import { canonicalUrl } from './canonical-url.ts';
import { eventPath } from '../event-path.ts';
import { LOCALES } from '../i18n/locales.ts';
import type { ArchivedEvent } from '../events/archived-schema.ts';
import type { SitemapUrl } from './event-sitemap-urls.ts';

/** When the page was last written: the record's own stamp, else the day the
 *  event ended. Never today — telling a crawler that a page from August
 *  changed this morning is how a sitemap stops being believed. */
const stampOf = (event: ArchivedEvent): string =>
  [event.cr]
    .filter((seconds): seconds is number => seconds !== undefined)
    .map((seconds) => new Date(seconds * 1000).toISOString().slice(0, 10))
    .at(0) ?? (event.e ?? event.s);

/**
 * Every page of an event that has been and gone, in every language.
 *
 * These are the short, specific pages the project exists to make, and they
 * keep working forever — the collector holds a copy of each record that does
 * not expire. Listing them is what stops a crawler from forgetting a page it
 * once had: a page offered nowhere is a page that quietly leaves the index.
 */
export const archivedSitemapUrls = (
  events: readonly ArchivedEvent[],
  site: URL | undefined,
): readonly SitemapUrl[] =>
  events.flatMap((event) =>
    LOCALES.map((lang) => ({
      loc: canonicalUrl(lang, eventPath(event), site),
      lastmod: stampOf(event),
      alternates: alternateLinks(eventPath(event), site),
    })),
  );
