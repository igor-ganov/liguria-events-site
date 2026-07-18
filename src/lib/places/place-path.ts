/** In-site path of a place detail page, for localizedUrl(lang, …).
 *  The id rides in the query — one client-rendered route, like landmarks. */
export const placePath = (id: string): string => `place/?id=${encodeURIComponent(id)}`;
