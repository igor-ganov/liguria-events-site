import type { MapLibreMap } from 'maplibre-gl';

/**
 * Run work that belongs after the map's `load` — correctly even when `load` has
 * ALREADY fired.
 *
 * The event corpus is fetched as an asset rather than inlined, so the flows are
 * wired a moment after the map is created. Whenever the style wins that race, a
 * plain `map.on('load', …)` never runs: the map came up with no markers, behind
 * a skeleton that only the 9 s soft-reveal timer cleared. Registering through
 * this helper makes the ordering irrelevant.
 */
export const whenMapReady = (map: MapLibreMap, run: () => void): void => {
  [map].filter((candidate) => candidate.loaded()).forEach(() => run());
  [map].filter((candidate) => !candidate.loaded()).forEach((candidate) => candidate.once('load', run));
};
