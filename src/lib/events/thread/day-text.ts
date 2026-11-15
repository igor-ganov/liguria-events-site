import { LOCALE_TAG } from '../../i18n/locale-tag.ts';
import type { Locale } from '../../i18n/locales.ts';

/** A calendar day in words of the page's language, in the parts asked for. */
export const dayText =
  (lang: Locale, parts: Intl.DateTimeFormatOptions) =>
  (iso: string): string =>
    new Intl.DateTimeFormat(LOCALE_TAG[lang], { ...parts, timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
