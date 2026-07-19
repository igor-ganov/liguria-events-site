import { decodePlaces } from './decode-places.ts';
import type { Place } from './place-schema.ts';
import type { Locale } from '../i18n/locales.ts';

const base = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

/** Fetch one region's place shard for a locale (built by scripts/build-places).
 *  On demand only — the map loads a region's shard when its bbox enters view.
 *  A missing shard (region not built yet) resolves to empty, never throws. */
export const loadPlaces = async (region: string, lang: Locale): Promise<readonly Place[]> => {
  const res = await fetch(`${base}/data/places/${region}.${lang}.json`, {
    headers: { accept: 'application/json' },
  });
  return res.ok ? decodePlaces(await res.json(), region) : [];
};
