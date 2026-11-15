/**
 * Installed in every document after snapFeed: from the moment Back is pressed,
 * has every animation frame written down (a `feed-snap` per frame) until the
 * page has said it is ready, the feed is no longer kept hidden, and a few more
 * frames have passed. Self-contained,
 * because Playwright prints it into the page.
 *
 * The record lives in sessionStorage, because Back can keep the window (the
 * router swaps the page), replace it (a full load) or bring an old one back
 * (the back/forward cache), and the record has to survive all three. Nothing is
 * recorded until the spec arms it.
 */
export const recordBackFrames = (): void => {
  const KEY = 'back-frames';
  const AFTER_READY = 10;
  const ready = { at: -1 };
  const frames = (): string[] => JSON.parse(sessionStorage.getItem(KEY) ?? '[]');
  const count = (): number => frames().length;
  // A page kept out of sight is not ready yet, whatever it has said.
  const since = (): number => Math.max(ready.at, frames().findLastIndex((frame) => frame.startsWith('false|')) + 1);
  const tick = (): void => {
    dispatchEvent(new CustomEvent('feed-snap', { detail: KEY }));
    const done = ready.at >= 0 && count() - since() > AFTER_READY;
    [done].filter((stop) => !stop).forEach(() => requestAnimationFrame(tick));
    [done].filter(Boolean).forEach(() => sessionStorage.setItem(`${KEY}-done`, '1'));
  };
  const start = (): void =>
    [sessionStorage.getItem(`${KEY}-armed`)].filter((armed) => armed === '1').forEach(() => {
      sessionStorage.removeItem(`${KEY}-armed`);
      ready.at = -1;
      requestAnimationFrame(tick);
    });
  const settle = (): void => {
    ready.at = count();
  };
  addEventListener('popstate', start);
  addEventListener('pageshow', (event) => [event.persisted].filter(Boolean).forEach(() => (start(), settle())));
  document.addEventListener('astro:page-load', settle);
  addEventListener('feed-left', () => {
    sessionStorage.removeItem(`${KEY}-left`);
    dispatchEvent(new CustomEvent('feed-snap', { detail: `${KEY}-left` }));
  });
  start();
};
