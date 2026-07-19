import { decodePlaces } from './decode-places.ts';
import type { Place } from './place-schema.ts';
import type { Locale } from '../i18n/locales.ts';

/** A Cloudflare Fetcher (the worker's ASSETS binding). */
type Assets = { fetch: (input: string) => Promise<Response> };

// Parsed once per warm isolate, then reused across requests — the SSR detail
// routes read this instead of shipping the 2 MB asset to the browser.
const cache = new Map<Locale, readonly Place[]>();

/** All places for a locale, from the worker's own static asset (cached). */
export const placesFor = async (assets: Assets, lang: Locale): Promise<readonly Place[]> => {
  const hit = cache.get(lang);
  if (hit) return hit;
  const res = await assets.fetch(`https://assets.local/data/places.${lang}.json`);
  const data = res.ok ? decodePlaces(await res.json()) : [];
  cache.set(lang, data);
  return data;
};
