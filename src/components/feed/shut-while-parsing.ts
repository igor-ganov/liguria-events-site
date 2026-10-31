/**
 * Run `mark` now and again each time the parser adds to the page, until it is
 * done. The days arrive in chunks over the network, and a day folded only after
 * it was painted would jump; a mutation callback runs before the browser paints
 * what the parser added. After an in-page navigation the page is already whole,
 * so the one run is all there is.
 * Self-contained: it is printed into the page (feedDaysBoot).
 */
export const shutWhileParsing = (mark: () => void): void => {
  mark();
  const watcher = new MutationObserver(mark);
  watcher.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => watcher.disconnect(), { once: true });
  [document.readyState].filter((state) => state !== 'loading').forEach(() => watcher.disconnect());
};
