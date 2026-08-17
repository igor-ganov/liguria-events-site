import { isDefined } from '../../lib/is-defined.ts';
import { routeFeature } from './route-feature.ts';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Line } from './map-types.ts';

const addLayer = (map: MapLibreMap, data: GeoJSON.Feature): void => {
  map.addSource('route', { type: 'geojson', data });
  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route',
    paint: { 'line-color': '#e5484d', 'line-width': 3, 'line-dasharray': [2, 1.5] },
  });
};

/** Draw (or update) the dashed route line: one line per day. */
export const drawRouteLine = (map: MapLibreMap, lines: readonly Line[]): void => {
  const data = routeFeature(lines);
  const source = map.getSource<GeoJSONSource>('route');
  [source].filter(isDefined).forEach((live) => live.setData(data));
  [map].filter(() => source === undefined).forEach((live) => addLayer(live, data));
};
