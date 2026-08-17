import maplibregl from 'maplibre-gl';
import { routeMapStyle } from './route-map-style.ts';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { MapDrawerState } from './map-types.ts';

const create = (container: HTMLElement): MapLibreMap => {
  const map = new maplibregl.Map({
    container,
    style: routeMapStyle(),
    center: [8.93, 44.41],
    zoom: 11,
    attributionControl: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  return map;
};

/** The drawer's one map instance, created on the first draw and reused after. */
export const ensureRouteMap = (state: MapDrawerState, canvas: HTMLElement): MapLibreMap => {
  const map = state.map ?? create(canvas);
  state.map = map;
  return map;
};
