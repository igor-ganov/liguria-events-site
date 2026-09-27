import { canonicalUrl } from './canonical-url.ts';
import { DEFAULT_LOCALE } from '../i18n/default-locale.ts';
import { ENTRY_LOCALE } from '../i18n/entry-locale.ts';
import { LOCALES } from '../i18n/locales.ts';
import type { Locale } from '../i18n/locales.ts';

/** One <link rel="alternate"> row. */
export type AlternateLink = Readonly<{ hreflang: string; href: string }>;

// Where a crawler that speaks none of our languages is sent: the language the
// site speaks by default — but only when the page has it. On a root-only page
// the Italian URL was never built, and naming it would repeat the /it/terms/
// mistake in the x-default row.
const fallbackOf = (locales: readonly Locale[]): Locale =>
  locales.find((locale) => locale === ENTRY_LOCALE) ?? DEFAULT_LOCALE;

/**
 * Every hreflang a page declares: one per locale it EXISTS in, then the
 * x-default a crawler falls back to when it speaks none of them.
 *
 * The locales are a parameter because not every page has all three. The legal
 * and utility pages are built at the root only, and declaring /it/terms/ for
 * them handed Google four URLs that answered 404 — in our own markup.
 */
export const alternateLinks = (
  path: string,
  site: URL | undefined,
  locales: readonly Locale[] = LOCALES,
): readonly AlternateLink[] => [
  ...locales.map((loc) => ({ hreflang: loc, href: canonicalUrl(loc, path, site) })),
  { hreflang: 'x-default', href: canonicalUrl(fallbackOf(locales), path, site) },
];
