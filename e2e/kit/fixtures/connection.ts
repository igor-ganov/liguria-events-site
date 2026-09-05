import { CEILING_MS } from '../ceiling-ms.ts';
import type { BrowserContext, Page } from '@playwright/test';

/** Fast 3G, the connection a budget is worth measuring on. Everything fits on
 *  a desktop link; the regressions only appear when the pipe is narrow. */
const FAST_3G = {
  offline: false,
  downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
  uploadThroughput: Math.floor((750 * 1024) / 8),
  latency: 150,
};

/**
 * The network, as something a spec can change.
 *
 * `ready` is a gate rather than a convenience: going offline before the
 * service worker controls the page tests nothing, because the browser answers
 * from its own HTTP cache or fails outright and the worker under test never
 * runs.
 *
 * Named `connection` and not `offline` because Playwright already has an
 * `offline` option on the context, and a fixture of that name deadlocks the
 * fixture graph with an error that names neither.
 */
export type Connection = Readonly<{
  ready: () => Promise<void>;
  cut: () => Promise<void>;
  restore: () => Promise<void>;
  slow: () => Promise<void>;
}>;

export const connectionFor = (page: Page, context: BrowserContext): Connection => ({
  ready: async () => {
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), undefined, {
      timeout: CEILING_MS,
    });
  },
  cut: () => context.setOffline(true),
  restore: () => context.setOffline(false),
  slow: async () => {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', FAST_3G);
  },
});
