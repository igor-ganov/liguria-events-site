import maplibregl from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';
import { drawRouteLine } from './draw-route-line.ts';
import { ensureRouteMap } from './ensure-route-map.ts';
import { fitToPoints } from './fit-to-points.ts';
import { pinElement } from './pin-element.ts';
import { routeLines } from './route-lines.ts';
import { routeMarkers } from './route-markers.ts';
import { wireMapClick } from './wire-map-click.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';
import type { RouteDay } from '../../lib/favorites/build-route.ts';
import type { MapDrawerState } from './map-types.ts';
import type { LngLat } from './render-types.ts';

/** Re-place every marker and redraw the line for the given days. */
export const drawRoute = (
  state: MapDrawerState,
  canvas: HTMLElement,
  onClick: ((at: LngLat) => void) | undefined,
  days: readonly RouteDay[],
  baseOf?: (day: string) => DayBase,
): void => {
  const map = ensureRouteMap(state, canvas);
  wireMapClick(state, map, onClick);
  state.markers.forEach((marker) => marker.remove());
  const specs = routeMarkers(days, baseOf);
  state.markers = specs.map((spec) =>
    new maplibregl.Marker({ element: pinElement(spec) }).setLngLat([spec.at[0], spec.at[1]]).addTo(map),
  );
  fitToPoints(map, specs.map((spec) => spec.at));
  const lines = routeLines(days);
  const paint = (): void => drawRouteLine(map, lines);
  branch(Boolean(map.isStyleLoaded()))<void>(paint, () => {
    map.once('load', paint);
  });
};
