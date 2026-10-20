import type { Locale } from './locales.ts';

// import.meta.env is absent under `bun test`; default the base there.
const base = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

/**
 * Base-path-aware URL for a locale + in-site path ('' | 'liguria/' |
 * 'event/ID/').
 *
 * Every language is prefixed, English included. It was not: English was the
 * site with no prefix, which made `/` the English version of the home page
 * rather than the door to the site, kept a whole duplicate tree of route files
 * at the root mirroring `[lang]/`, and left the one language nobody here reads
 * holding the addresses Google had indexed.
 */
export const localizedUrl = (lang: Locale, path = ''): string => `${base}/${lang}/${path}`;
