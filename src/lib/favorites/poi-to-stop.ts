import type { FavPoi } from './fav-pois.ts';
import type { RouteStop } from './route-types.ts';

/** Resolve a favourited landmark/place into a stop: no fixed time, a wide date
 *  span (so it's available every day), and a 60-minute default duration. */
export const poiToStop = (poi: FavPoi): RouteStop => ({
  id: poi.id,
  t: poi.name,
  s: '0000-01-01',
  e: '9999-12-31',
  c: ['other'],
  g: [poi.lat, poi.lng],
  u: poi.url,
  href: poi.url,
  du: 60,
});
