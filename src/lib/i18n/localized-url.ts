import { branch } from '../branch.ts';
import { DEFAULT_LOCALE } from './default-locale.ts';
import type { Locale } from './locales.ts';

// import.meta.env is absent under `bun test`; default the base there.
const base = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

/** Base-path-aware URL for a locale + in-site path ('' | 'feed/' | 'event/ID/').
 *  Default locale lives at the root; others are prefixed (i18n design §6). */
export const localizedUrl = (lang: Locale, path = ''): string =>
  branch(lang === DEFAULT_LOCALE)(
    () => `${base}/${path}`,
    () => `${base}/${lang}/${path}`,
  );
