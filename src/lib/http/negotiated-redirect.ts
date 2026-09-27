/**
 * A 302 whose target depends on the reader's language, and which says so.
 *
 * Without the Vary header the first visitor's language becomes everybody's:
 * Cloudflare, a corporate proxy or the browser itself would hand the cached
 * answer to the next reader, whatever that reader asked for.
 */
export const negotiatedRedirect = (to: string): Response =>
  new Response(undefined, {
    status: 302,
    headers: { location: to, vary: 'accept-language' },
  });
