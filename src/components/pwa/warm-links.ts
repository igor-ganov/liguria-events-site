/**
 * Ask the worker to have the neighbouring pages ready.
 *
 * Sent after this page has finished, so it competes with nothing the reader
 * asked for. The worker decides what is worth fetching — see `warmable`, which
 * keeps out anything personal, anything off-site and anything past a handful.
 *
 * This is what makes the app usable rather than merely resilient: without it,
 * a page nobody has opened is a page nobody can open with no signal.
 */
export const warmLinks = (): void => {
  addEventListener('load', () => {
    const links = [...document.querySelectorAll('a[href]')].map((anchor) => anchor.getAttribute('href') ?? '');
    navigator.serviceWorker?.controller?.postMessage({ kind: 'warm', links });
  });
};
