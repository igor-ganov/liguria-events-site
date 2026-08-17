import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import { drawRoute } from './draw-route.ts';
import { isDefined } from '../../lib/is-defined.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { MapDrawerState } from './map-types.ts';
import type { LngLat } from './render-types.ts';

/** A drawer owns one map instance and re-renders markers/line on each call.
 *  `onClick` (when given) reports map clicks — used to set the base by clicking. */
export const makeMapDrawer = (
  onClick?: (at: LngLat) => void,
): ((days: readonly RouteDay[], baseOf?: (day: string) => DayBase) => void) => {
  const state: MapDrawerState = { markers: [], clickWired: false };
  return (days, baseOf) => {
    [document.querySelector<HTMLElement>('[data-route-map]') ?? undefined].filter(isDefined).forEach((canvas) => {
      canvas.hidden = false;
      maplibregl.addProtocol('pmtiles', new Protocol().tile);
      drawRoute(state, canvas, onClick, days, baseOf);
    });
  };
};
