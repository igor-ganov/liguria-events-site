import { isCacheablePage } from './is-cacheable-page.ts';

/**
 * A courtesy, not a mirror. Warming happens on somebody's data plan, and a
 * page that pulls down two hundred events because they were linked from a
 * feed is a worse neighbour than one that waits.
 *
 * Twenty, not a dozen: half the room goes to the navigation every page
 * carries, and a dozen left three or four events on a feed of twenty. These
 * are documents, and the images in them are not warmed.
 */
const LIMIT = 20;

/** Two lists taken in turn, so neither kind of page can crowd out the other.
 *  Every page carries a header linking every region, and those come first in
 *  the markup: in document order a reader ended up holding eleven region feeds
 *  and none of the events they were reading. */
const alternating = (first: readonly string[], second: readonly string[]): readonly string[] =>
  Array.from({ length: Math.max(first.length, second.length) })
    .flatMap((_, index) => [first[index], second[index]])
    .filter((path): path is string => path !== undefined);

const pathOf = (link: string, origin: string): string | undefined =>
  [link]
    .filter((url) => url.startsWith('/') || url.startsWith(`${origin}/`))
    .map((url) => new URL(url, origin))
    .filter((url) => url.origin === origin)
    .map((url) => url.pathname)
    .at(0);

/**
 * Which of the links on a page are worth fetching before anybody taps them.
 *
 * The pages a reader can reach from here, quietly, once the page they are on
 * has finished loading — so the next tap is instant whether or not there is a
 * signal by then. Only pages that belong to everybody, only this origin, each
 * one once, and never more than a handful.
 */
export const warmable = (links: readonly string[], origin: string): readonly string[] => {
  const paths = links
    .map((link) => pathOf(link, origin))
    .filter((path): path is string => path !== undefined)
    .filter(isCacheablePage);
  const unique = [...new Set(paths)];
  return alternating(
    unique.filter((path) => path.startsWith('/event/')),
    unique.filter((path) => !path.startsWith('/event/')),
  ).slice(0, LIMIT);
};
