import { CACHE_NAME } from './cache-name.ts';

/**
 * Keep one file of the build, and answer with what it says.
 *
 * The text is what lets the walk follow whatever this file imports. A file
 * already held is read back rather than fetched again: these are named by
 * their content, so one that is there is the same file forever.
 */
export const storeAsset = async (url: string): Promise<string> => {
  const cache = await caches.open(CACHE_NAME);
  const held = await cache.match(url);
  const fetched = await Promise.all(
    [held]
      .filter((found) => found === undefined)
      .map(async () => {
        const response = await fetch(url).catch(() => undefined);
        await Promise.all(
          [response]
            .filter((found) => found !== undefined)
            .filter((found) => found.ok)
            .map((found) => cache.put(url, found.clone())),
        );
        return response;
      }),
  );
  return (await (fetched.at(0) ?? held)?.text()) ?? '';
};
