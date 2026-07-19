import { slug } from '../slug.ts';

/** In-site path of a place detail page, for localizedUrl(lang, …). Path-based
 *  readable slug (`place/ristorante-zeffirino--b12c9/`) — worker-SSR'd, so the
 *  URL is legible, unique, locale-stable and language-switchable natively. */
export const placePath = (name: string, id: string): string => `place/${slug.of(name, id)}/`;
