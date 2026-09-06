import { cachedPage } from './cached-page.ts';
import { storePage } from './store-page.ts';

/**
 * Fetch and keep the pages a reader can reach from where they are.
 *
 * Quietly, after the page they are on has finished, and only the ones not
 * already held — so the next tap is instant whether or not there is a signal
 * by then. One at a time: warming is a courtesy on somebody's connection, and
 * a burst of parallel requests would compete with whatever they actually asked
 * for.
 */
export const warmPages = async (paths: readonly string[], origin: string, nowMs: number): Promise<void> => {
  for (const path of paths) {
    const request = new Request(`${origin}${path}`);
    const held = await cachedPage(request);
    await Promise.all(
      [held]
        .filter((copy) => copy === undefined)
        .map(async () => {
          const response = await fetch(request).catch(() => undefined);
          await Promise.all(
            [response].filter((found) => found !== undefined).map((found) => storePage(request, found, nowMs)),
          );
        }),
    );
  }
};
