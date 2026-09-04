import { cacheFirst } from './cache-first.ts';
import { networkFirst } from './network-first.ts';
import { staleWhileRevalidate } from './stale-while-revalidate.ts';
import { strategyOf } from './strategy-of.ts';
import type { Strategy } from './strategy.ts';

type Handler = (request: Request) => Promise<Response>;

const HANDLERS: Readonly<Record<Strategy, Handler | undefined>> = {
  'network-first': networkFirst,
  'cache-first': cacheFirst,
  'stale-while-revalidate': staleWhileRevalidate,
  // Not a handler that calls fetch(): the worker declines to answer at all, so
  // the browser makes the request itself — cookies, streaming and range
  // requests included. Passing it through fetch() would change behaviour.
  'network-only': undefined,
};

/** The response for a request, or nothing when the worker should stand aside. */
export const respond = (request: Request, origin: string): Promise<Response> | undefined =>
  HANDLERS[strategyOf(request, origin)]?.(request);
