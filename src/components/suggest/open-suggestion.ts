import { localizedUrl } from '../../lib/i18n/localized-url.ts';
import type { Locale } from '../../lib/i18n/locales.ts';
import type { SuggestDoc } from '../../lib/suggest/suggest-doc.ts';

/** Go to what a suggestion names, in the page's language. */
export const openSuggestion =
  (lang: Locale) =>
  (doc: SuggestDoc): void =>
    location.assign(localizedUrl(lang, doc.path));
