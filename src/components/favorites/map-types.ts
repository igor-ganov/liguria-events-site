// The shapes the route map drawer is written against. Types only.
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';

export type PinKind = 'stop' | 'base' | 'final';

/** A marker to place: where, which pin, and (for a stop) its number and
 *  tight-connection flag. Produced purely from the route, drawn by the shell. */
export type MarkerSpec = Readonly<{
  kind: PinKind;
  at: readonly [number, number]; // [lng, lat]
  n: number;
  tight: boolean;
}>;

/** A drawn path as maplibre wants it: [lng, lat] pairs. */
export type Line = readonly (readonly [number, number])[];

/** The drawer's retained instance state — one map, the markers it currently
 *  shows, and whether the click listener is already attached. */
export type MapDrawerState = {
  map?: MapLibreMap | undefined;
  markers: readonly Marker[];
  clickWired: boolean;
};
