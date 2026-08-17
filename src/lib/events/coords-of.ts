/** `{ g: [lng, lat] }` when the row carries a position, nothing otherwise. Tested
 *  for presence rather than truthiness: 0° is a real coordinate. */
export const coordsOf = (
  lat: number | null,
  lng: number | null,
): Readonly<{ g?: readonly [number, number] }> =>
  [{ lat, lng }]
    .filter((pair): pair is { lat: number; lng: number } => pair.lat !== null && pair.lng !== null)
    .map((pair): Readonly<{ g: readonly [number, number] }> => ({ g: [pair.lng, pair.lat] }))
    .at(0) ?? {};
