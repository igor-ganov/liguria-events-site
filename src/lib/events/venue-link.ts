import { localizedUrl } from '../i18n/localized-url.ts';
import { venuePagePath } from './venue-page-path.ts';
import type { CompactEvent } from './event-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** The address of an event's venue page in one language, or nothing when the
 *  venue has no page of its own (see venuePagePath). */
export const venueLink =
  (lang: Locale) =>
  (event: CompactEvent): string | undefined =>
    [venuePagePath(event)].filter((path): path is string => path !== undefined).map((path) => localizedUrl(lang, path)).at(0);
