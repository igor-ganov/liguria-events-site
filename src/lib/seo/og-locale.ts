import type { Locale } from '../i18n/locales.ts';

// og:locale expects a language_TERRITORY tag, not the bare ISO code.
const OG_LOCALE: Readonly<Record<Locale, string>> = { en: 'en_US', it: 'it_IT', ru: 'ru_RU' };

/** The og:locale tag for a page's language. */
export const ogLocale = (lang: Locale): string => OG_LOCALE[lang];
