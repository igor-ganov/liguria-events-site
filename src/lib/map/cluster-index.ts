/** One entry of a viewport query: a cluster plaque or a single point. The
 *  payload type is erased because a query mixes both — see pointPayload. */
export type ClusterPoint = Readonly<{
  geometry: Readonly<{ coordinates: readonly number[] }>;
  properties: unknown;
}>;

/**
 * The one method a marker layer needs from a supercluster index, typed
 * structurally (like MapBounds) so the render loop can be driven by a stub and
 * never has to name supercluster's payload generics.
 */
export type ClusterIndex = Readonly<{
  getClusters: (
    bbox: [number, number, number, number],
    zoom: number,
  ) => readonly ClusterPoint[];
}>;
