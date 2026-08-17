import type { Feature, Point } from 'geojson';
import { isDefined } from '../is-defined.ts';

/**
 * The GeoJSON point features a supercluster index is loaded from: one per item
 * that HAS a coordinate — an event that was never geocoded simply is not on the
 * map — carrying whatever the render loop needs as the feature's properties.
 * Curried so a layer fixes its coordinate reader once and reuses it.
 */
export const pointFeatures =
  <T>(at: (item: T) => readonly [number, number] | undefined) =>
  <P>(properties: (item: T) => P) =>
  (items: readonly T[]): Feature<Point, P>[] =>
    items.flatMap((item): Feature<Point, P>[] =>
      [at(item)]
        .filter(isDefined)
        .map((point): Feature<Point, P> => ({
          type: 'Feature',
          properties: properties(item),
          geometry: { type: 'Point', coordinates: [point[0], point[1]] },
        })),
    );
