/** The four edge readers of a maplibre `LngLatBounds`, structurally typed so the
 *  bbox decision stays testable without a live map. */
export type MapBounds = Readonly<{
  getWest: () => number;
  getSouth: () => number;
  getEast: () => number;
  getNorth: () => number;
}>;

/**
 * The viewport as the [west, south, east, north] bbox supercluster queries by —
 * the "what is in view" question every layer's render loop asks.
 */
export const boundsBbox = (bounds: MapBounds): [number, number, number, number] => [
  bounds.getWest(),
  bounds.getSouth(),
  bounds.getEast(),
  bounds.getNorth(),
];
