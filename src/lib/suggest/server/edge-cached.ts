/**
 * An answer from this data centre's cache, or made and kept there when it is
 * a success. The key is the normalised query, so "Jazz  tonight" and "jazz
 * tonight" share one entry and one model call. `keep` is the request's
 * waitUntil: the reader does not wait for the cache write.
 */
export const edgeCached = async (
  key: string,
  make: () => Promise<Response>,
  keep: (work: Promise<unknown>) => void,
): Promise<Response> => {
  const cache = await caches.open('suggest');
  const hit = await cache.match(key);
  return (
    hit ??
    make().then((answer) => {
      [answer].filter((made) => made.ok).forEach((made) => keep(cache.put(key, made.clone())));
      return answer;
    })
  );
};
