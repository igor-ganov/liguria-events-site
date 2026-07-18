/** In-site path of a landmark detail page, for localizedUrl(lang, …).
 *  The id (`wd:Q…` / `osm:node/…`) rides in the query — the page is one
 *  client-rendered route, not 2 800 static pages. */
export const landmarkPath = (id: string): string => `landmark/?id=${encodeURIComponent(id)}`;
