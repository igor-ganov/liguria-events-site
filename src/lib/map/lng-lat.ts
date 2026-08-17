/**
 * A GeoJSON position as the fixed [lng, lat] pair maplibre's marker and popup
 * APIs take. GeoJSON types a position as an open `number[]` (it may carry an
 * altitude), which those APIs refuse, so the pair is rebuilt here once.
 */
export const lngLat = (position: readonly number[]): [number, number] => [
  position[0] ?? 0,
  position[1] ?? 0,
];
