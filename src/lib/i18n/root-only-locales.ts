import type { Locale } from './locales.ts';

/**
 * The language versions of a page that is built at the root only: none.
 *
 * Some pages — the legal ones, the settings screen — have no translated twin
 * and no prefix either. Declaring one anyway is not a harmless overshoot: it
 * hands a crawler a URL that answers 404, which is exactly what happened to
 * /it/terms/, and what would have happened to /en/terms/ when English took a
 * prefix and these pages did not.
 *
 * An empty list is the page saying it is not in a language. It is answered at
 * one address, that address is its canonical, and it declares no alternates
 * because it has none.
 */
export const ROOT_ONLY: readonly Locale[] = [];
