import type { Line } from './map-types.ts';

/** The route's day lines as one GeoJSON feature the map source can take. */
export const routeFeature = (lines: readonly Line[]): GeoJSON.Feature => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'MultiLineString', coordinates: lines.map((line) => line.map((p) => [p[0], p[1]])) },
});
