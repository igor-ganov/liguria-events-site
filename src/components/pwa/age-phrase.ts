import type { Staleness } from '../../lib/pwa/staleness-parts.ts';

/**
 * "2 hours ago", in the reader's language.
 *
 * Intl writes all three languages, so the dictionaries only carry the sentence
 * around this. Nothing is a value too: under a minute old, `numeric: 'auto'`
 * says "this minute" rather than "in 0 minutes".
 */
export const agePhrase = (lang: string, age: Staleness | undefined): string => {
  const relative = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  return [age]
    .filter((found) => found !== undefined)
    .map((found) => relative.format(-found.value, found.unit))
    .at(0) ?? relative.format(0, 'minute');
};
