import { branch } from '../branch.ts';
import type { FavPoi } from './fav-poi.ts';

const field = (obj: unknown, key: string): unknown =>
  branch(Object(obj) === obj)<unknown>(
    () => Reflect.get(Object(obj), key),
    () => undefined,
  );

const num = (v: unknown): number | undefined =>
  branch(typeof v === 'number' && Number.isFinite(v))<number | undefined>(
    () => Number(v),
    () => undefined,
  );

const str = (v: unknown): string | undefined =>
  branch(typeof v === 'string')<string | undefined>(
    () => String(v),
    () => undefined,
  );

const kindOf = (raw: unknown): FavPoi['kind'] =>
  branch(field(raw, 'kind') === 'place')<FavPoi['kind']>(
    () => 'place',
    () => 'landmark',
  );

const build = (raw: unknown, id: string, name: string, url: string, lat: number, lng: number): FavPoi => ({
  id,
  kind: kindOf(raw),
  region: str(field(raw, 'region')) ?? 'liguria',
  name,
  lat,
  lng,
  cat: str(field(raw, 'cat')) ?? '',
  url,
});

/** Read one POI out of untrusted JSON; undefined when a required field is
 *  missing or of the wrong type. */
export const parseFavPoi = (raw: unknown): FavPoi | undefined => {
  const id = str(field(raw, 'id'));
  const name = str(field(raw, 'name'));
  const url = str(field(raw, 'url'));
  const lat = num(field(raw, 'lat'));
  const lng = num(field(raw, 'lng'));
  return (
    (id !== undefined &&
      name !== undefined &&
      url !== undefined &&
      lat !== undefined &&
      lng !== undefined &&
      build(raw, id, name, url, lat, lng)) ||
    undefined
  );
};
