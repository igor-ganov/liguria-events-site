import { branch } from '../branch.ts';

/** A restorable map camera: the zoom and centre the visitor left behind. */
export type MapCameraView = Readonly<{ zoom: number; lat: number; lng: number }>;

/**
 * Read the saved camera from a query string — "?z=11.4&c=44.4123,8.9312".
 * It lives in the QUERY, not the hash: maplibre's own `hash` option writes a
 * hash, but Astro's client router drops it on a back navigation while the query
 * survives. Returns undefined unless `z` is present and all three numbers parse.
 */
export const readView = (params: URLSearchParams): MapCameraView | undefined => {
  const zoom = Number(params.get('z'));
  const [lat, lng] = (params.get('c') ?? '').split(',').map(Number);
  const usable =
    params.has('z') &&
    Number.isFinite(zoom) &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);
  return branch(usable)(
    () => ({ zoom, lat: Number(lat), lng: Number(lng) }),
    () => undefined,
  );
};
