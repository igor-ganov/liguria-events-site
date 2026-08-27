import type { Locale } from './locales.ts';

const RULES: Partial<Record<Locale, Intl.PluralRules>> = {};

const rulesFor = (lang: Locale): Intl.PluralRules => (RULES[lang] ??= new Intl.PluralRules(lang));

/**
 * Which form a language wants for this number. Asked of the platform rather
 * than written by hand: Russian starts over at twenty-one, and `n === 1` gets
 * that wrong in a way nobody notices until a native speaker reads the page.
 */
export const pluralForm = (lang: Locale, count: number): Intl.LDMLPluralRule =>
  rulesFor(lang).select(count);
