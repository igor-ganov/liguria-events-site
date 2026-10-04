import type { Locale } from '../i18n/locales.ts';

/** The BCP 47 tag whose date form each site language reads as natural. British
 *  English for the day-first order the other two already use. */
const TAGS: Readonly<Record<Locale, string>> = { en: 'en-GB', it: 'it-IT', ru: 'ru-RU' };

/** An ISO day as a reader writes it — "4 October 2026", "4 ottobre 2026", and
 *  the Russian genitive — with the month declined where the language declines
 *  it. Formatted in UTC from a UTC midnight, so the day never slides. */
export const longDate = (lang: Locale, iso: string): string =>
  new Intl.DateTimeFormat(TAGS[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));
