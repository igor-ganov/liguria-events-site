import { PLACES_MIN_ZOOM } from './places-min-zoom.ts';

/**
 * Whether the places layer should be drawing AND fetching right now: the chip
 * has to be on and the camera close enough. Gating both on one predicate is
 * what keeps a low-zoom toggle from pulling whole regions of venues — the
 * layer's render loop and its shard loader read the same answer.
 */
export const placesVisible = (enabled: boolean, zoom: number): boolean =>
  enabled && zoom >= PLACES_MIN_ZOOM;
