import { LOCALES } from './locales.ts';
import type { Locale } from './locales.ts';

export const isLocale = (value: unknown): value is Locale =>
  LOCALES.some((locale) => locale === value);
