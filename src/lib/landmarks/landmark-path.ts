import { slug } from '../slug.ts';

/** In-site path of a landmark detail page, for localizedUrl(lang, …). Region-
 *  scoped readable slug (`landmark/liguria/acquario-di-genova--a3f9k/`) — the
 *  region lets the worker-SSR route load just that shard; the slug stays legible,
 *  unique (per region), locale-stable and language-switchable natively. */
export const landmarkPath = (region: string, name: string, id: string): string =>
  `landmark/${region}/${slug.of(name, id)}/`;
