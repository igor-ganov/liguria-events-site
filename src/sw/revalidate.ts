import { cachedPage } from './cached-page.ts';
import { storePage } from './store-page.ts';
import type { PageMessage } from './page-message.ts';

const changed = async (request: Request, fresh: Response): Promise<boolean> => {
  const stored = await cachedPage(request);
  const before = await stored?.text();
  return before !== (await fresh.clone().text());
};

/**
 * Ask the site for the page already on screen, and store what comes back.
 *
 * The reader is told the outcome either way — something newer to take, a copy
 * confirmed current, or no connection at all — because those are three
 * different things to do about the same page.
 */
export const revalidate = async (request: Request, nowMs: number): Promise<PageMessage> => {
  const fresh = await fetch(request).catch(() => undefined);
  const outcome = await Promise.all(
    [fresh]
      .filter((response) => response !== undefined)
      .filter((response) => response.ok)
      .map(async (response) => {
        const differs = await changed(request, response);
        await storePage(request, response.clone(), nowMs);
        return differs;
      }),
  );
  const KIND: Readonly<Record<string, PageMessage['kind'] | undefined>> = { true: 'fresh', false: 'same' };
  return { kind: KIND[String(outcome.at(0))] ?? 'offline', url: request.url };
};
