import { slug } from '../slug.ts';

/** In-site path of a place detail page, for localizedUrl(lang, …). Region-scoped
 *  readable slug (`place/liguria/ristorante-zeffirino--b12c9/`) — the region lets
 *  the worker-SSR route load just that shard; the slug stays legible, unique
 *  (per region), locale-stable and language-switchable natively. */
export const placePath = (region: string, name: string, id: string): string =>
  `place/${region}/${slug.of(name, id)}/`;
