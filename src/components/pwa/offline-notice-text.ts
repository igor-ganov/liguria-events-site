import type { Staleness } from '../../lib/pwa/staleness-parts.ts';

/**
 * What the offline bar says, in the reader's language.
 *
 * Intl writes the "40 minutes ago" part in all three languages, so the only
 * thing the dictionaries carry is the sentence around it.
 */
export const offlineNoticeText = (
  lang: string,
  saved: string,
  age: Staleness | undefined,
): string =>
  [age]
    .filter((found) => found !== undefined)
    .map((found) => new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(-found.value, found.unit))
    .map((when) => saved.replace('{when}', when))
    .at(0) ?? saved.replace('{when}', new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(0, 'minute'));
