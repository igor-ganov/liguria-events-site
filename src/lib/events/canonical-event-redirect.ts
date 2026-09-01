import { eventPath } from '../event-path.ts';
import { eventSlug } from './event-slug.ts';
import { isDefined } from '../is-defined.ts';
import { localizedUrl } from '../i18n/localized-url.ts';
import type { EventAddress } from './event-slug.ts';
import type { Locale } from '../i18n/locales.ts';

/**
 * Where an event page should send a reader who arrived at some other spelling
 * of the same event.
 *
 * There are two kinds: the bare id every link minted before this — thousands of
 * them, in Google, in chats, in the sitemap — and an address whose words have
 * gone stale because the author retitled the event. Both name the event; only
 * one is its address now, and a page that answers to several addresses is a
 * page search engines have to guess about.
 *
 * The query survives the move: a freshly created event carries `?created`, and
 * losing it would drop the author on a page that no longer leads with the link
 * they came to send.
 */
export const canonicalEventRedirect = (
  lang: Locale,
  requested: string,
  event: EventAddress | undefined,
  search: string,
): string | undefined =>
  [event]
    .filter(isDefined)
    .filter((found) => eventSlug(found) !== requested)
    .map((found) => `${localizedUrl(lang, eventPath(found))}${search}`)
    .at(0);
