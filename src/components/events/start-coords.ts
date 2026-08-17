/** A map centre, in MapLibre's lng-then-lat order. */
export type LngLatPair = [number, number];

/**
 * The pin the form opens with: the 0-or-1 coordinate pair its hidden lat/lng
 * inputs already carry. An empty or unparseable pair yields none, which is what
 * moves the picker to its default view instead of to NaN.
 */
export const startCoords = (
  lat: string | undefined,
  lng: string | undefined,
): readonly LngLatPair[] => {
  const y = Number.parseFloat(lat ?? '');
  const x = Number.parseFloat(lng ?? '');
  const pairs: readonly LngLatPair[] = [[x, y]];
  return pairs.filter(() => Number.isFinite(x) && Number.isFinite(y));
};
