/**
 * The zoom at which places appear. They are venue-level detail — a region's
 * shard holds tens of thousands of them — so below this the layer neither
 * fetches nor draws: on an overview camera it is both unreadable (one blob of
 * cluster plaques) and ruinous (four neighbouring regions measured 15.6 MB and
 * blocked the main thread for minutes). The region-count cap alone did not
 * prevent that, because four dense regions are under it.
 */
export const PLACES_MIN_ZOOM = 10;
