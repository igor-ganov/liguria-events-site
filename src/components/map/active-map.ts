import type { MapLibreMap } from 'maplibre-gl';

/**
 * The live map, held module-level for the two flows that cannot be handed it:
 * the URL writer (which appends the camera on every move) and the SPA teardown.
 * Releasing the WebGL context on leave matters — each visit used to leak one
 * until the browser dropped the oldest, leaving a blank basemap under the
 * (DOM) markers.
 */
export const activeMap: { current: MapLibreMap | undefined } = { current: undefined };
