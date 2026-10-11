import { feedRest } from './feed-rest.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/**
 * Do something that concerns every event of the feed — a search, a filter, a
 * card arriving late. The days folded away are fetched and unfolded first, and
 * `then` runs once they are on the page. With nothing folded, or nothing left
 * folded, it runs at once: the wait is paid by the first thing that needs the
 * whole feed and by nothing after it.
 */
export const wholeFeed =
  (lang: Locale) =>
  (then: () => void): void => {
    [feedRest(lang)(then)].filter((waiting) => !waiting).forEach(then);
  };
