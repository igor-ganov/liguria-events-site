import { localizedUrl } from '../i18n/localized-url.ts';
import type { Locale } from '../i18n/locales.ts';

/** A page inside a city: /genova/, /genova/calendar/, /ru/milano/map/.
 *  The city is always in the path — a link is a place, not a session. */
export const cityUrl = (lang: Locale, city: string, path = ''): string =>
  localizedUrl(lang, `${city}/${path}`);
