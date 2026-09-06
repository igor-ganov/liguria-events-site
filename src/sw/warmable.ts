import { isCacheablePage } from './is-cacheable-page.ts';

/**
 * A courtesy, not a mirror. Warming happens on somebody's data plan, and a
 * page that pulls down two hundred events because they were linked from a
 * feed is a worse neighbour than one that waits.
 */
const LIMIT = 12;

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
  return [...new Set(paths)].slice(0, LIMIT);
};
