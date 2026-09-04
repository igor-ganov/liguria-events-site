/**
 * Bump the number to abandon everything the previous worker stored. Every
 * cache whose name is not this one is deleted on activation, which is the only
 * way a caching mistake that shipped can be taken back.
 */
export const CACHE_NAME = 'dovego-v1';
