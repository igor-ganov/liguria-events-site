import { REGION_GEO } from './region-geo.ts';
import { nearestOf } from '../geo/nearest-of.ts';
import type { LatLng } from '../geo/haversine-meters.ts';

const centres = Object.entries(REGION_GEO).map(([slug, geo]) => ({
  slug,
  lat: (geo.bbox[1] + geo.bbox[3]) / 2,
  lng: (geo.bbox[0] + geo.bbox[2]) / 2,
}));

const insideBox = (slug: string, point: LatLng): boolean => {
  const bbox = REGION_GEO[slug]?.bbox;
  return (
    bbox !== undefined &&
    point[1] >= bbox[0] &&
    point[1] <= bbox[2] &&
    point[0] >= bbox[1] &&
    point[0] <= bbox[3]
  );
};

/**
 * The region a point falls in. The boxes are deliberately generous and overlap
 * along the borders, so a point inside more than one is settled by whichever
 * centre is closer — and a point outside every box (at sea, or abroad) still
 * resolves to the nearest region rather than to nothing.
 */
export const regionAt = (point: LatLng): string =>
  nearestOf(
    centres.filter((centre) => insideBox(centre.slug, point)),
    point,
  )
    .concat(nearestOf(centres, point))
    .map((hit) => hit.item.slug)
    .at(0) ?? '';
