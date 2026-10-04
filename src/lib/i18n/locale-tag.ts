import type { Locale } from './locales.ts';

/** The BCP 47 tag whose number and date forms each site language reads as
 *  natural. British English, for the day-first order the other two use. */
export const LOCALE_TAG: Readonly<Record<Locale, string>> = { en: 'en-GB', it: 'it-IT', ru: 'ru-RU' };
