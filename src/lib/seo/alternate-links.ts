import { canonicalUrl } from './canonical-url.ts';
import { DEFAULT_LOCALE } from '../i18n/default-locale.ts';
import { LOCALES } from '../i18n/locales.ts';

/** One <link rel="alternate"> row. */
export type AlternateLink = Readonly<{ hreflang: string; href: string }>;

/** Every hreflang a page declares: one per locale, then the x-default a crawler
 *  falls back to when it speaks none of them. */
export const alternateLinks = (path: string, site: URL | undefined): readonly AlternateLink[] => [
  ...LOCALES.map((loc) => ({ hreflang: loc, href: canonicalUrl(loc, path, site) })),
  { hreflang: 'x-default', href: canonicalUrl(DEFAULT_LOCALE, path, site) },
];
