import type { Locale } from './locales.ts';

/**
 * The language a reader gets when they have asked for none.
 *
 * Not the same thing as DEFAULT_LOCALE, which is a fact about the URL scheme —
 * the root path is English and stays English, because that is where the indexed
 * pages live. This answers a different question: what does the site speak when
 * nobody says? The events are in Italy and the audience reads Italian, so a
 * request with no Accept-Language, and the x-default a crawler falls back to,
 * both land on /it/.
 */
export const ENTRY_LOCALE: Locale = 'it';
