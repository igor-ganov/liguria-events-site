/** A page is worth keeping only with what it needs to work. Twenty is every
 *  script and stylesheet a page of this site has, several times over. */
const LIMIT = 20;

const REFERENCE = /<(?:script|link)[^>]*?(?:src|href)="([^"]+)"/gi;

// Scripts, stylesheets, and the folded days of a feed (splitFeedTail), which
// a page names in a hint and cannot show the rest of itself without.
const ASSET = /\.(?:js|css)$|^\/data\/tails\//i;

/**
 * The scripts and stylesheets a stored page cannot work without.
 *
 * A page kept on its own is markup and nothing else: with no signal its menu
 * does not open, its filters do nothing, and anything it builds after loading
 * is simply absent — which is how the map page came off the device and then
 * sat on a loading skeleton, because the file that starts the map had never
 * been fetched. Only this origin, only scripts and stylesheets, each one once.
 */
export const pageAssets = (html: string, origin: string): readonly string[] => {
  const found = [...html.matchAll(REFERENCE)]
    .map((match) => match[1] ?? '')
    .filter((url) => url.startsWith('/') || url.startsWith(`${origin}/`))
    .map((url) => new URL(url, origin))
    .filter((url) => url.origin === origin)
    .filter((url) => ASSET.test(url.pathname))
    .map((url) => url.pathname);
  return [...new Set(found)].slice(0, LIMIT);
};
