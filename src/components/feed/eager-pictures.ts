const LAZY = 'loading="lazy"';
const EAGER = 'loading="eager"';

// What the leading cards of a page are given, by their place on it. The first
// is the largest thing a phone paints, so it goes ahead of everything else; the
// next few are on the first screen of a wider one.
const LEADING: readonly string[] = [`${EAGER} fetchpriority="high"`, EAGER, EAGER, EAGER];

/**
 * A card is built to fetch its photograph when it is scrolled to. The cards a
 * reader sees without scrolling must not wait for that: the browser only
 * learns they are on screen after layout, and fetches them last.
 */
export const eagerPictures =
  (rank: number) =>
  (cardHtml: string): string =>
    cardHtml.replace(LAZY, LEADING[rank] ?? LAZY);
