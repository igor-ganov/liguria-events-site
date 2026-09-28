import { freshEnough } from './fresh-enough.ts';
import { fromStore } from './from-store.ts';
import { offlinePage } from './offline-page.ts';
import { revalidate } from './revalidate.ts';
import { trackOutcome } from './track-outcome.ts';
import { STORED_AT } from './stored-at-header.ts';
import { storePage } from './store-page.ts';
import type { KeepAlive } from './keep-alive.ts';

/**
 * A page, from the device first.
 *
 * The copy on the device is handed over at once and the site is asked behind
 * it. That is the difference between an app and a website with a fallback: no
 * navigation waits for a server, and the reader is told how old what they are
 * looking at is instead of being made to wait for something current.
 *
 * With no copy, or one too old to still be this site, the network is awaited —
 * and its answer is kept, which is how the next visit is instant. A copy past
 * the ceiling is not thrown away: it is what the reader gets if the network has
 * nothing to offer.
 */
export const pageFirst = async (request: Request, keepAlive: KeepAlive): Promise<Response> => {
  const stored = await fromStore(request);
  const storedMs = Number(stored?.headers.get(STORED_AT) ?? 0);
  return [stored]
    .filter((copy) => copy !== undefined)
    .filter(() => freshEnough(storedMs, Date.now()))
    .map((copy) => {
      keepAlive(trackOutcome(request.url, revalidate(request, Date.now())));
      return copy;
    })
    .at(0) ?? fetchAndKeep(request, keepAlive, stored);
};

const fetchAndKeep = async (
  request: Request,
  keepAlive: KeepAlive,
  stale: Response | undefined,
): Promise<Response> => {
  const response = await fetch(request).catch(() => undefined);
  return [response]
    .filter((found) => found !== undefined)
    .map((found) => {
      keepAlive(storePage(request, found.clone(), Date.now()));
      return found;
    })
    // No network. An old copy is still better than the browser's error page over
    // a device that holds most of the site; with neither, the offline page is
    // the only way back to the rest of it.
    .at(0) ?? stale ?? offlinePage();
};
