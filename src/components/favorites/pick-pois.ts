/** Only the POIs that actually ended up in the route, so a shared or
 *  cross-device viewer resolves its landmarks/places without the author's
 *  localStorage. */
export const pickPois = <T>(
  placed: ReadonlySet<string>,
  pois: Readonly<Record<string, T>>,
): Readonly<Record<string, T>> =>
  Object.fromEntries(Object.entries(pois).filter(([id]) => placed.has(id)));
