/** A coordinate pair as stored: both degrees or neither, because half a position
 *  puts a pin in the sea. Anything unparsable is the database's empty marker. */
export const coordinatesOf = (
  lat: string,
  lng: string,
): Readonly<{ lat: number | null; lng: number | null }> =>
  [{ lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }]
    .filter((pair) => Number.isFinite(pair.lat) && Number.isFinite(pair.lng))
    .at(0) ?? { lat: null, lng: null };
