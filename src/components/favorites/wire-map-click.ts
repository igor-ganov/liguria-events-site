import { isDefined } from '../../lib/is-defined.ts';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { MapDrawerState } from './map-types.ts';
import type { LngLat } from './render-types.ts';

/** Report map clicks (used to set the base by clicking), attached once. */
export const wireMapClick = (
  state: MapDrawerState,
  map: MapLibreMap,
  onClick?: (at: LngLat) => void,
): void => {
  [onClick]
    .filter(isDefined)
    .filter(() => !state.clickWired)
    .forEach((report) => {
      state.clickWired = true;
      map.on('click', (event) => report({ lng: event.lngLat.lng, lat: event.lngLat.lat }));
    });
};
