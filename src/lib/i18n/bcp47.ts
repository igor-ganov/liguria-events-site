import type { Locale } from './locales.ts';

/**
 * The tag Intl wants for one of our locales.
 *
 * 'en' alone formats a date the American way — "October 12, 2026" — and this
 * site's English is British everywhere else, down to "Favourites".
 */
export const BCP47: Readonly<Record<Locale, string>> = {
  en: 'en-GB',
  it: 'it-IT',
  ru: 'ru-RU',
};
