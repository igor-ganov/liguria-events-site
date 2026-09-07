import { pageLinks } from './page-links.ts';

/** Long enough for a list to finish arriving, short enough that the second
 *  message is still ahead of the reader's first tap. */
const QUIET_MS = 400;
const WATCH_MS = 10_000;

/**
 * Say it now, and again once the page has finished putting itself together.
 *
 * A feed builds its list after the load event, so at the moment load fires the
 * links that matter most — the events somebody is looking at — are not in the
 * document yet, and warming saw only the navigation every page carries. That
 * is how a reader offline ended up holding every region and not one event.
 *
 * Watching costs nothing: the worker skips what it already has.
 */
export const keepWarm = (worker: ServiceWorker): void => {
  const send = (): void => worker.postMessage({ kind: 'warm', links: pageLinks() });
  const pending = { id: 0 };
  const observer = new MutationObserver(() => {
    clearTimeout(pending.id);
    pending.id = window.setTimeout(send, QUIET_MS);
  });
  send();
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), WATCH_MS);
};
