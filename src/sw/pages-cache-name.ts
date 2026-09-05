/**
 * Pages kept for a reader with no signal, in a cache of their own.
 *
 * Separate from the asset cache on purpose: this one is emptied whenever the
 * person using the device changes, and assets — which belong to nobody — have
 * no reason to be thrown away with them.
 */
export const PAGES_CACHE = 'dovego-pages-v1';
