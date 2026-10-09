import { bareEntry } from './bare-entry.ts';
import { preferredLocale } from './preferred-locale.ts';
import { regionUrl } from '../region/region-url.ts';

/**
 * Where a front door leads, or undefined for every other address.
 *
 * Three decisions meet here and none of them is a constant: the page comes from
 * the address, the language from Accept-Language unless the address names one,
 * and the region from the reader's own location or, failing that, from where the
 * events are. All of it is a 302, because every one of those answers can change
 * between two visits.
 *
 * The query string rides along. It used to be dropped, which meant a front door
 * erased whatever brought the reader: `/?utm_source=google&utm_medium=cpc`
 * landed on `/it/lombardia/` with nothing on it, so a click we had paid for
 * arrived as "direct" — the same silent fall to "direct" the notification and
 * the channel links each took in turn.
 */
export const entryPath = (
  pathname: string,
  acceptLanguage: string | undefined,
  region: string,
  search = '',
): string | undefined =>
  [bareEntry(pathname)]
    .filter((entry) => entry !== undefined)
    .map((entry) => regionUrl(entry.lang ?? preferredLocale(acceptLanguage), region, entry.page))
    .map((path) => `${path}${search}`)
    .at(0);
