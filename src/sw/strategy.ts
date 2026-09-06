/** How the service worker answers one request. */
export type Strategy =
  | 'page-first'
  | 'network-first'
  | 'cache-first'
  | 'stale-while-revalidate'
  | 'network-only';
