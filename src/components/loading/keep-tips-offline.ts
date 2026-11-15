import { tipsUrl } from '../../lib/loading/tips-url.ts';

/** On a first visit the worker takes control only after the tips were fetched,
 *  so it never saw them. Ask once more when it does: the worker keeps what it
 *  answers, and the next load without a connection still has a tip. */
export const keepTipsOffline = (): void => {
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    void fetch(tipsUrl(document.documentElement.lang), { priority: 'low' }).catch(() => undefined);
  });
};
