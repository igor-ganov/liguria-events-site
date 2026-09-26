// A day. The mapping from a stray address to its event is stable while the
// event exists, and an event that ends redirects onward from its own page.
const MAX_AGE = 86_400;

/**
 * A 301 that may be cached. Astro's own redirect sends no cache headers, so
 * every crawler that invents an address asks again on every pass — tens of
 * thousands of times a day, each one waking the worker.
 */
export const permanentRedirect = (to: string): Response =>
  new Response(undefined, {
    status: 301,
    headers: { location: to, 'cache-control': `public, max-age=${MAX_AGE}` },
  });
