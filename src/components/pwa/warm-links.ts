import { warmTarget } from './warm-target.ts';

/**
 * Ask the worker to have this page and the ones around it ready.
 *
 * Sent after this page has finished, so it competes with nothing the reader
 * asked for. The worker decides what is worth fetching — see `warmable`, which
 * keeps out anything personal, anything off-site and anything past a handful.
 *
 * The page includes ITSELF, because the first visit to a site is answered
 * before the worker controls anything: without this, a reader who opened the
 * app once and then lost signal had nothing at all, which is the whole failure
 * this file exists to prevent.
 */
export const warmLinks = (): void => {
  addEventListener('load', () => {
    const links = [
      location.pathname,
      ...[...document.querySelectorAll('a[href]')].map((anchor) => anchor.getAttribute('href') ?? ''),
    ];
    void warmTarget().then((worker) => worker?.postMessage({ kind: 'warm', links }));
  });
};
