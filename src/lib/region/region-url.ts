import { localizedUrl } from '../i18n/localized-url.ts';
import type { Locale } from '../i18n/locales.ts';

/**
 * A page inside a region: /liguria/, /toscana/calendar/, /ru/lazio/map/. The
 * region is always in the path — a link is a place, not a session.
 *
 * No region means the front door of that page: `/`, `/calendar`, `/map`, the
 * ones that ask which region. They are addresses this could not say before,
 * because an empty region left a double slash behind — and they were redirects
 * rather than pages, so nothing needed to link to them.
 */
export const regionUrl = (lang: Locale, region: string, path = ''): string =>
  localizedUrl(lang, `${[region].filter((slug) => slug !== '').map((slug) => `${slug}/`).join('')}${path}`);
