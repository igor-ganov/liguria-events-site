import type { Locale } from '../i18n/locales.ts';
import type { CompactEvent } from './event-schema.ts';

/** Display title in a locale; empty/absent falls back to the original (AC-2b.2). */
export const titleOf =
  (lang: Locale) =>
  (event: CompactEvent): string =>
    (event.tl?.[lang] || event.t) ?? event.t;
