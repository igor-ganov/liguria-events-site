import { decodePlaces } from './decode-places.ts';
import type { Place } from './place-schema.ts';
import type { Locale } from '../i18n/locales.ts';

const base = (import.meta.env?.BASE_URL ?? '').replace(/\/$/, '');

/** Fetch the current locale's place asset (built by scripts/build-places).
 *  On demand only — nothing loads until the page opens or the map layer is on. */
export const loadPlaces = async (lang: Locale): Promise<readonly Place[]> => {
  const res = await fetch(`${base}/data/places.${lang}.json`, {
    headers: { accept: 'application/json' },
  });
  return decodePlaces(await res.json());
};
