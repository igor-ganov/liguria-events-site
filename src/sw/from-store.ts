import { STORED_AT } from './stored-at-header.ts';
import { cachedPage } from './cached-page.ts';
import { markedFromCache } from './marked-from-cache.ts';

const HTML = 'text/html';

const marked = async (stored: Response): Promise<Response> => {
  const storedMs = Number(stored.headers.get(STORED_AT) ?? 0);
  const body = await stored.text();
  return new Response(markedFromCache(body, storedMs), {
    status: stored.status,
    statusText: stored.statusText,
    headers: stored.headers,
  });
};

/**
 * The stored copy of a page, told to say so.
 *
 * Only a document is rewritten; anything else is served as it was kept.
 */
export const fromStore = async (request: Request): Promise<Response | undefined> => {
  const stored = await cachedPage(request);
  return [stored]
    .filter((found) => found !== undefined)
    .filter((found) => (found.headers.get('content-type') ?? '').includes(HTML))
    .map(marked)
    .at(0) ?? stored;
};
