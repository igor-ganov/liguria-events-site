import { localizedUrl } from '../i18n/localized-url.ts';
import type { Locale } from '../i18n/locales.ts';

/** A page inside a region: /liguria/, /toscana/calendar/, /ru/lazio/map/.
 *  The region is always in the path — a link is a place, not a session. */
export const regionUrl = (lang: Locale, region: string, path = ''): string =>
  localizedUrl(lang, `${region}/${path}`);
