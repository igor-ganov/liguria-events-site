import type { Locale } from '../../i18n/locales.ts';

/**
 * "Every Thursday", Monday first, in each language. Written out rather than
 * built from the weekday's name: Russian says it in the dative plural ("по
 * четвергам"), which no date formatter produces.
 */
export const WEEKLY_PHRASE: Readonly<Record<Locale, readonly string[]>> = {
  en: ['Every Monday', 'Every Tuesday', 'Every Wednesday', 'Every Thursday', 'Every Friday', 'Every Saturday', 'Every Sunday'],
  it: ['Ogni lunedì', 'Ogni martedì', 'Ogni mercoledì', 'Ogni giovedì', 'Ogni venerdì', 'Ogni sabato', 'Ogni domenica'],
  ru: ['По понедельникам', 'По вторникам', 'По средам', 'По четвергам', 'По пятницам', 'По субботам', 'По воскресеньям'],
};
