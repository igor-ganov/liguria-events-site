const LINKED = /<script type="module" src="/g;

/**
 * Ask for a page's module scripts at low priority. A module never holds up a
 * first paint — but a browser fetches it as urgently as the photograph and the
 * typeface the first screen is made of, and forty small files then share the
 * connection with them. Nothing here needs a script to be seen; the scripts
 * wire what is already on the page, and can arrive behind it.
 */
export const scriptsAfterPaint = (html: string): string =>
  html.replace(LINKED, '<script type="module" fetchpriority="low" src="');
