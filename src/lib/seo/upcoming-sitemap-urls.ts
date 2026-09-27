import { alternateLinks } from './alternate-links.ts';
import { canonicalUrl } from './canonical-url.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { eventPath } from '../event-path.ts';
import { isUpcoming } from '../events/is-upcoming.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './sitemap-url.ts';

const stampOf = (event: CompactEvent, fallback: string): string =>
  [event.cr]
    .filter((seconds): seconds is number => seconds !== undefined)
    .map((seconds) => new Date(seconds * 1000).toISOString().slice(0, 10))
    .at(0) ?? fallback;

/**
 * The events still to come — one entry each, in the language the site speaks.
 *
 * Its own file because it is the part that changes: a page here is new today
 * and gone in a fortnight, and a crawler that has learned this file moves can
 * come back for it without re-reading the archive.
 *
 * One locale, not three. Listing all three tripled a file whose reader manages
 * a dozen fetches a day, to say something the entry already says: every row
 * carries the hreflang alternates, which is how Google is meant to learn the
 * other languages of a page it has decided to keep.
 */
export const upcomingSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] =>
  events.filter(isUpcoming(today)).map((event) => ({
    loc: canonicalUrl(ENTRY_LOCALE, eventPath(event), site),
    lastmod: stampOf(event, today),
    alternates: alternateLinks(eventPath(event), site),
  }));
