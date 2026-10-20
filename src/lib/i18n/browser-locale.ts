import { ENTRY_LOCALE } from './entry-locale.ts';
import { isLocale } from './is-locale.ts';
import type { Locale } from './locales.ts';

/**
 * The language to send a reader onward in, from the list their browser states.
 *
 * `navigator.languages`, not Accept-Language, because the front door is a
 * prerendered page: the assets layer answers it and no middleware runs, so this
 * is where a reader's stated language can still be read. Down to the primary
 * subtag — it-CH is Italian — and a language we do not write in falls through
 * to the one the site is written for.
 */
export const browserLocale = (languages: readonly string[]): Locale =>
  languages
    .map((tag) => tag.toLowerCase().split('-').at(0))
    .filter(isLocale)
    .at(0) ?? ENTRY_LOCALE;
