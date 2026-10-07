import { queryAll } from '../../lib/dom/query-all.ts';

// Well before the end is on screen, so the reader scrolls into days that are
// already there rather than into a gap that fills.
const AHEAD = '1200px';

/** Unfold the feed when the reader nears the end of the days that are shown:
 *  by scrolling, or by moving focus down the list. */
export const watchFeedFold = (unfold: () => void): void => {
  const watcher = new IntersectionObserver(
    (entries) => {
      entries.filter((entry) => entry.isIntersecting).slice(0, 1).forEach(() => {
        watcher.disconnect();
        unfold();
      });
    },
    { rootMargin: `0px 0px ${AHEAD} 0px` },
  );
  queryAll(document, '[data-feed-more]').forEach((marker) => watcher.observe(marker));
};
