// The extent of the country-wide extract the basemap is built from, with the
// islands in and the neighbours out: Nice, Ljubljana and Tunis are closer to it
// than Bolzano, and none of them is in it.
const WEST = 6.6;
const EAST = 18.6;
const SOUTH = 35.3;
const NORTH = 47.1;

/**
 * Whether a coordinate falls inside the basemap's extent.
 *
 * It used to be Liguria's bounding box, from when Liguria was the only extract
 * there was. The country extract arrived and this did not move, so "find me"
 * answered a reader in Milan with "you are outside the map area" — of a map that
 * draws Milan perfectly well. The Liguria extract is still there and still used,
 * but only for detail at high zoom; see withDetailSource.
 */
export const inMapArea = (lon: number, lat: number): boolean =>
  lon >= WEST && lon <= EAST && lat >= SOUTH && lat <= NORTH;
