import type { Locale } from '../i18n/locales.ts';
import type { CompactEvent } from './event-schema.ts';

/** Event description in a locale, empty treated as missing → en (AC-3.1). */
export const descriptionOf =
  (lang: Locale) =>
  (event: CompactEvent): string =>
    (event.d?.[lang] || event.d?.en) ?? '';
