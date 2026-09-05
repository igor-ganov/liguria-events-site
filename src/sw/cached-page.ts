import { PAGES_CACHE } from './pages-cache-name.ts';

/** The stored copy of a page, if there is one. */
export const cachedPage = async (request: Request): Promise<Response | undefined> =>
  (await (await caches.open(PAGES_CACHE)).match(request)) ?? undefined;
