import { isDefined } from '../../lib/is-defined.ts';
import { routeFeature } from './route-feature.ts';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Line } from './map-types.ts';

/** The line on the map is the same thread as the one down the feed, so it
 *  takes its colour from the same token and follows the theme with it. */
const threadColour = (): string =>
  getComputedStyle(document.documentElement).getPropertyValue('--filo').trim() || '#33697a';

const addLayer = (map: MapLibreMap, data: GeoJSON.Feature): void => {
  map.addSource('route', { type: 'geojson', data });
  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route',
    paint: { 'line-color': threadColour(), 'line-width': 3, 'line-dasharray': [2, 1.5] },
  });
};

/** Draw (or update) the dashed route line: one line per day. */
export const drawRouteLine = (map: MapLibreMap, lines: readonly Line[]): void => {
  const data = routeFeature(lines);
  const source = map.getSource<GeoJSONSource>('route');
  [source].filter(isDefined).forEach((live) => live.setData(data));
  [map].filter(() => source === undefined).forEach((live) => addLayer(live, data));
};
