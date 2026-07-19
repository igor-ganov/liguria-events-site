/** Geographic anchors for Italy's twenty regions, shared by the client (which
 *  region shards intersect the current map viewport) and the build scripts
 *  (Overpass `area["ISO3166-2"=…]` + Overture bbox pushdown). bbox is
 *  [west, south, east, north] in degrees — deliberately a touch generous so a
 *  venue near a border is never dropped by a too-tight box. */
export type RegionGeo = Readonly<{ iso: string; bbox: readonly [number, number, number, number] }>;

export const REGION_GEO: Readonly<Record<string, RegionGeo>> = {
  abruzzo: { iso: 'IT-65', bbox: [13.0, 41.68, 14.79, 42.9] },
  basilicata: { iso: 'IT-77', bbox: [15.33, 39.89, 16.87, 41.14] },
  calabria: { iso: 'IT-78', bbox: [15.63, 37.9, 17.21, 40.15] },
  campania: { iso: 'IT-72', bbox: [13.75, 39.99, 15.81, 41.51] },
  'emilia-romagna': { iso: 'IT-45', bbox: [9.19, 43.72, 12.76, 45.14] },
  'friuli-venezia-giulia': { iso: 'IT-36', bbox: [12.32, 45.58, 13.92, 46.65] },
  lazio: { iso: 'IT-62', bbox: [11.44, 40.78, 14.04, 42.84] },
  liguria: { iso: 'IT-42', bbox: [7.49, 43.75, 10.07, 44.68] },
  lombardia: { iso: 'IT-25', bbox: [8.49, 44.67, 11.44, 46.65] },
  marche: { iso: 'IT-57', bbox: [12.17, 42.68, 13.92, 43.98] },
  molise: { iso: 'IT-67', bbox: [14.0, 41.36, 15.17, 42.07] },
  piemonte: { iso: 'IT-21', bbox: [6.62, 44.05, 9.22, 46.47] },
  puglia: { iso: 'IT-75', bbox: [14.92, 39.78, 18.53, 42.23] },
  sardegna: { iso: 'IT-88', bbox: [8.12, 38.84, 9.84, 41.32] },
  sicilia: { iso: 'IT-82', bbox: [11.9, 35.48, 15.66, 38.82] },
  toscana: { iso: 'IT-52', bbox: [9.67, 42.23, 12.38, 44.48] },
  'trentino-alto-adige': { iso: 'IT-32', bbox: [10.37, 45.67, 12.48, 47.1] },
  umbria: { iso: 'IT-55', bbox: [11.89, 42.35, 13.28, 43.62] },
  'valle-d-aosta': { iso: 'IT-23', bbox: [6.79, 45.46, 7.95, 46.0] },
  veneto: { iso: 'IT-34', bbox: [10.61, 44.78, 13.11, 46.69] },
};

/** Region slugs whose bbox intersects the given map bounds — the shards a
 *  viewport needs. West/east/south/north are the map's current edges. */
export const regionsInView = (
  west: number,
  south: number,
  east: number,
  north: number,
): readonly string[] =>
  Object.entries(REGION_GEO)
    .filter(([, g]) => g.bbox[0] <= east && g.bbox[2] >= west && g.bbox[1] <= north && g.bbox[3] >= south)
    .map(([slug]) => slug);
