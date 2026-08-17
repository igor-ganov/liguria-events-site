import maplibregl from 'maplibre-gl';
import { isDefined } from '../../lib/is-defined.ts';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Line } from './map-types.ts';

/** Frame every point of the route; a route with no located point is left alone. */
export const fitToPoints = (map: MapLibreMap, points: Line): void => {
  [points[0]].filter(isDefined).forEach((first) => {
    const bounds = points.reduce(
      (acc, p) => acc.extend([p[0], p[1]]),
      new maplibregl.LngLatBounds([first[0], first[1]], [first[0], first[1]]),
    );
    map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
  });
};
