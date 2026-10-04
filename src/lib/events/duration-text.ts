import { LOCALE_TAG } from '../i18n/locale-tag.ts';
import type { Locale } from '../i18n/locales.ts';

type Unit = 'hour' | 'minute';
type Part = readonly [amount: number, unit: Unit];

const said = (lang: Locale) => ([amount, unit]: Part): string =>
  new Intl.NumberFormat(LOCALE_TAG[lang], { style: 'unit', unit, unitDisplay: 'narrow' }).format(amount);

const partsOf = (minutes: number): readonly Part[] => [
  [Math.floor(minutes / 60), 'hour'],
  [minutes % 60, 'minute'],
];

/** Minutes the way a reader says them: hours and minutes, each in the short
 *  form of the language, with whichever of the two is zero left out. */
export const durationText = (lang: Locale, minutes: number): string =>
  partsOf(minutes)
    .filter(([amount]) => amount > 0)
    .map(said(lang))
    .join(' ');
