/** How the service worker answers one request. */
export type Strategy = 'network-first' | 'cache-first' | 'stale-while-revalidate' | 'network-only';
