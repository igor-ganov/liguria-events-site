import { dayText } from './day-text.ts';
import type { Locale } from '../../i18n/locales.ts';

// What stands between the weekday and the date. Spelled out here because ICU
// builds disagree on it: the same bun prints "Sun, 15 November" on Windows and
// "Sun 15 November" on Linux.
const JOINER: Readonly<Record<Locale, string>> = { en: ', ', it: ' ', ru: ', ' };

/** "Sun, 15 November" in the page's language, the same on every platform. */
export const weekdayDayText =
  (lang: Locale) =>
  (iso: string): string =>
    `${dayText(lang, { weekday: 'short' })(iso)}${JOINER[lang]}${dayText(lang, { day: 'numeric', month: 'long' })(iso)}`;
