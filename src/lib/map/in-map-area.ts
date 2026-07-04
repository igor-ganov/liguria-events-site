/** Whether a coordinate falls inside the self-hosted Liguria tile extent.
 *  Outside it the basemap has no tiles, so centring there would look blank. */
export const inMapArea = (lon: number, lat: number): boolean =>
  lon >= 8.2 && lon <= 9.75 && lat >= 44.05 && lat <= 44.7;
