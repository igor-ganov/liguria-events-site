import { slug } from '../slug.ts';

/** In-site path of a landmark detail page, for localizedUrl(lang, …). Path-based
 *  readable slug (`landmark/acquario-di-genova--a3f9k/`) — worker-SSR'd, so the
 *  URL is legible, unique, locale-stable and language-switchable natively. */
export const landmarkPath = (name: string, id: string): string => `landmark/${slug.of(name, id)}/`;
