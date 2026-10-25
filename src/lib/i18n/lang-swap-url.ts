import { isLocale } from './is-locale.ts';
import type { Locale } from './locales.ts';

/**
 * The address of the same page in another language: the language segment
 * swapped, the query and the fragment kept.
 *
 * Nothing for a page already in that language, or in none at all (the legal
 * pages, the front door): there is nothing to swap, so nothing to go to.
 */
export const langSwapUrl = (url: URL, lang: Locale): URL | undefined =>
  [url.pathname.split('/')]
    .filter((parts) => isLocale(parts[1] ?? '') && parts[1] !== lang)
    .map((parts) => new URL(`${[parts[0], lang, ...parts.slice(2)].join('/')}${url.search}${url.hash}`, url))
    .at(0);
