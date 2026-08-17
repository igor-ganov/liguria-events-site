import type { Locale } from '../i18n/locales.ts';

/** A day heading in the reader's language ('Saturday, 4 July'). Midday keeps
 *  the date from sliding across a timezone. */
export const dayLabel = (iso: string, lang: Locale): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
