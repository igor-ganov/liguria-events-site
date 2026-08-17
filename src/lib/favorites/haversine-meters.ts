import type { Coords } from './route-types.ts';

const EARTH_R = 6371000;

const rad = (d: number): number => (d * Math.PI) / 180;

/** Great-circle distance in metres between two [lat, lng] points. */
export const haversineMeters = (a: Coords, b: Coords): number => {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
};
