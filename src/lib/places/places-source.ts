import { decodedShard } from './decoded-shard.ts';
import type { Place } from './place-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** A Cloudflare Fetcher (the worker's ASSETS binding). */
type Assets = { fetch: (input: string) => Promise<Response> };

// Parsed once per warm isolate per (region, locale), then reused across requests
// — the SSR detail route reads its region's shard, not the whole country.
const cache = new Map<string, readonly Place[]>();

/** All places for one region + locale, from the worker's own static shard. */
export const placesFor = async (assets: Assets, region: string, lang: Locale): Promise<readonly Place[]> => {
  const key = `${region}.${lang}`;
  const hit = cache.get(key);
  // A 0-or-1 array: a warm cache maps over nothing, so nothing is fetched.
  const loaded = await Promise.all(
    [hit].filter((cached) => cached === undefined).map(async () => {
      const data = await decodedShard(await assets.fetch(`https://assets.local/data/places/${region}.${lang}.json`), region);
      cache.set(key, data);
      return data;
    }),
  );
  return hit ?? loaded.at(0) ?? [];
};
