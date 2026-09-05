import { CEILING_MS } from '../ceiling-ms.ts';
import { withCeiling } from '../with-ceiling.ts';
import type { Page, Response } from '@playwright/test';

/** What the page is asking the network for, observed rather than waited out. */
export type Net = Readonly<{
  settled: () => Promise<void>;
  response: (pattern: string | RegExp) => Promise<Response>;
  seen: (pattern: RegExp) => number;
}>;

export const netFor = (page: Page): Net => {
  const asked: string[] = [];
  let inflight = 0;
  page.on('request', (request) => {
    asked.push(request.url());
    inflight += 1;
  });
  const done = (): void => {
    inflight -= 1;
  };
  page.on('requestfinished', done);
  page.on('requestfailed', done);

  // Resolves on the event that empties the queue, or at once if it is already
  // empty. No polling and no sleep: `networkidle` is a hidden half-second that
  // proves nothing, and this proves exactly one thing — nothing is in flight.
  const idle = (): Promise<void> =>
    new Promise((resolve) => {
      const check = (): void => {
        [inflight]
          .filter((count) => count === 0)
          .forEach(() => {
            page.off('requestfinished', check);
            page.off('requestfailed', check);
            resolve();
          });
      };
      page.on('requestfinished', check);
      page.on('requestfailed', check);
      check();
    });

  return {
    settled: async () => {
      await page.waitForFunction(() => document.readyState === 'complete', undefined, { timeout: CEILING_MS });
      await withCeiling(idle(), 'the network to go quiet');
    },
    response: (pattern) => page.waitForResponse(pattern, { timeout: CEILING_MS }),
    seen: (pattern) => asked.filter((url) => pattern.test(url)).length,
  };
};
