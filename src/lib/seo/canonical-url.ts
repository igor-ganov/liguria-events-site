import { localizedUrl } from '../i18n/localized-url.ts';
import type { Locale } from '../i18n/locales.ts';

/** The absolute URL of a page in one locale — what <link rel="canonical"> and
 *  og:url both point at. */
export const canonicalUrl = (lang: Locale, path: string, site: URL | undefined): string =>
  new URL(localizedUrl(lang, path), site).toString();
