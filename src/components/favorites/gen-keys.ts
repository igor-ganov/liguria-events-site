type GenKeys = Readonly<{
  durations: string;
  order: string;
  times: string;
  pauses: string;
  routes: string;
}>;

/** The localStorage keys the favourites-page route generator owns: manual
 *  durations, the per-day drag order, pinned start times, manual breaks, and
 *  the local list of routes this device created. */
export const GEN_KEYS: GenKeys = {
  durations: 'dovego:durations',
  order: 'dovego:route-order',
  times: 'dovego:route-times',
  pauses: 'dovego:route-pauses',
  routes: 'dovego:routes',
};
