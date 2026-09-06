import { fromStore } from './from-store.ts';
import { offlinePage } from './offline-page.ts';
import { revalidate } from './revalidate.ts';
import { trackOutcome } from './track-outcome.ts';
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
 * With no copy there is nothing to be quick about, so the network is awaited —
 * and its answer is kept, which is how the next visit is instant.
 */
export const pageFirst = async (request: Request, keepAlive: KeepAlive): Promise<Response> => {
  const stored = await fromStore(request);
  return [stored]
    .filter((copy) => copy !== undefined)
    .map((copy) => {
      keepAlive(trackOutcome(request.url, revalidate(request, Date.now())));
      return copy;
    })
    .at(0) ?? fetchAndKeep(request, keepAlive);
};

const fetchAndKeep = async (request: Request, keepAlive: KeepAlive): Promise<Response> => {
  const response = await fetch(request).catch(() => undefined);
  return [response]
    .filter((found) => found !== undefined)
    .map((found) => {
      keepAlive(storePage(request, found.clone(), Date.now()));
      return found;
    })
    // No copy and no network. Without this the fetch simply rejects and the
    // browser shows its own error page — over a device that may well hold the
    // rest of the site, and with no way back to it.
    .at(0) ?? offlinePage();
};
