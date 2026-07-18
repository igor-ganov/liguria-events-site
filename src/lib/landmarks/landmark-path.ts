import { slug } from '../slug.ts';

/** In-site path of a landmark detail page, for localizedUrl(lang, …). The id in
 *  the query is a readable slug (`acquario-di-genova--a3f9k`) — one client-
 *  rendered route, not 2 800 static pages, but a legible, unique, stable URL. */
export const landmarkPath = (name: string, id: string): string => `landmark/?id=${slug.of(name, id)}`;
