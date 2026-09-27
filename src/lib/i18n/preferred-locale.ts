import { ENTRY_LOCALE } from './entry-locale.ts';
import { isLocale } from './is-locale.ts';
import { rankedLanguages } from './ranked-languages.ts';
import type { Locale } from './locales.ts';

/**
 * The language to answer a request in.
 *
 * A stated preference is honoured down to the primary subtag — it-CH is
 * Italian, en-GB is English. A preference we do not speak is not a preference
 * we can honour, so it falls through to ENTRY_LOCALE, and so does silence.
 */
export const preferredLocale = (acceptLanguage: string | undefined): Locale =>
  rankedLanguages(acceptLanguage)
    .map((tag) => tag.split('-').at(0))
    .filter(isLocale)
    .at(0) ?? ENTRY_LOCALE;
