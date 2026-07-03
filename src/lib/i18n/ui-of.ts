import { getEntry } from 'astro:content';
import { DEFAULT_LOCALE } from './default-locale.ts';
import type { Locale } from './locales.ts';
import type { Ui } from './ui-schema.ts';

/** Server-side UI dict for a locale, falling back to en (AC-1.4). */
export const uiOf = async (lang: Locale): Promise<Ui> => {
  const entry = (await getEntry('ui', lang)) ?? (await getEntry('ui', DEFAULT_LOCALE));
  return entry.data;
};
