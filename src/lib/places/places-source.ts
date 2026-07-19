import { decodePlaces } from './decode-places.ts';
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
  if (hit) return hit;
  const res = await assets.fetch(`https://assets.local/data/places/${region}.${lang}.json`);
  const data = res.ok ? decodePlaces(await res.json(), region) : [];
  cache.set(key, data);
  return data;
};
