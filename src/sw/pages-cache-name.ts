/**
 * Pages kept for a reader with no signal, in a cache of their own.
 *
 * Separate from the asset cache on purpose: this one is emptied whenever the
 * person using the device changes, and assets — which belong to nobody — have
 * no reason to be thrown away with them.
 */
// v2: v1 held pages the site links to without their trailing slash, and one
// of those was somebody's half-written event. A rename is how a mistake that
// already shipped is taken back from the devices holding it.
export const PAGES_CACHE = 'dovego-pages-v2';
