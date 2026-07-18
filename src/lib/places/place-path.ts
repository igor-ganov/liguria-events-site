import { slug } from '../slug.ts';

/** In-site path of a place detail page, for localizedUrl(lang, …). The id in the
 *  query is a readable slug (`ristorante-zeffirino--b12c9`) — client-rendered
 *  like landmarks, but with a legible, unique, locale-stable URL. */
export const placePath = (name: string, id: string): string => `place/?id=${slug.of(name, id)}`;
