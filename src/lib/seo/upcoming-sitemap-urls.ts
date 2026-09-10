import { alternateLinks } from './alternate-links.ts';
import { canonicalUrl } from './canonical-url.ts';
import { eventPath } from '../event-path.ts';
import { isUpcoming } from '../events/is-upcoming.ts';
import { LOCALES } from '../i18n/locales.ts';
import type { CompactEvent } from '../events/event-schema.ts';
import type { SitemapUrl } from './event-sitemap-urls.ts';

const stampOf = (event: CompactEvent, fallback: string): string =>
  [event.cr]
    .filter((seconds): seconds is number => seconds !== undefined)
    .map((seconds) => new Date(seconds * 1000).toISOString().slice(0, 10))
    .at(0) ?? fallback;

/**
 * The events still to come, in every language.
 *
 * Its own file because it is the part that changes: a page here is new today
 * and gone in a fortnight, and a crawler that has learned this file moves can
 * come back for it without re-reading the archive.
 */
export const upcomingSitemapUrls = (
  events: readonly CompactEvent[],
  today: string,
  site: URL | undefined,
): readonly SitemapUrl[] =>
  events.filter(isUpcoming(today)).flatMap((event) =>
    LOCALES.map((lang) => ({
      loc: canonicalUrl(lang, eventPath(event), site),
      lastmod: stampOf(event, today),
      alternates: alternateLinks(eventPath(event), site),
    })),
  );
