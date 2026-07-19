import { decodeLandmarks } from './decode-landmarks.ts';
import type { Landmark } from './landmark-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** A Cloudflare Fetcher (the worker's ASSETS binding). */
type Assets = { fetch: (input: string) => Promise<Response> };

// Parsed once per warm isolate per (region, locale) — see places-source.
const cache = new Map<string, readonly Landmark[]>();

/** All landmarks for one region + locale, from the worker's own static shard. */
export const landmarksFor = async (assets: Assets, region: string, lang: Locale): Promise<readonly Landmark[]> => {
  const key = `${region}.${lang}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const res = await assets.fetch(`https://assets.local/data/landmarks/${region}.${lang}.json`);
  const data = res.ok ? decodeLandmarks(await res.json(), region) : [];
  cache.set(key, data);
  return data;
};
