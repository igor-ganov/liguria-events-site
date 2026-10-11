import type { DeferredWork } from '../deferred-work.ts';

/** The part of a cache this needs: look an address up, keep an answer for it. */
export type EdgeStore = Readonly<{
  match: (key: string) => Promise<Response | undefined>;
  put: (key: string, response: Response) => Promise<void>;
}>;

const kept = (store: EdgeStore | undefined, key: string): Promise<Response | undefined> =>
  (store?.match(key) ?? Promise.resolve(undefined)).catch(() => undefined);

/**
 * Answer from the cache of the place the request arrived at, and read the
 * source only when that cache has nothing. A file in the bucket costs a round
 * trip to the bucket on every request otherwise — two hundred milliseconds on
 * the photograph a page is waiting for. Only a good answer is kept, after the
 * response has gone; a cache that is missing or failing changes nothing.
 */
export const edgeCached = async (
  store: EdgeStore | undefined,
  key: string,
  defer: DeferredWork,
  read: () => Promise<Response>,
): Promise<Response> => {
  const held = await kept(store, key);
  const answer = held ?? (await read());
  [store]
    .filter((cache) => cache !== undefined && held === undefined && answer.ok)
    .forEach((cache) => defer.waitUntil((cache?.put(key, answer.clone()) ?? Promise.resolve()).catch(() => undefined)));
  return answer;
};
