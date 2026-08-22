import type { Locale } from './locales.ts';

/**
 * The language versions of a page that is built at the root only.
 *
 * Some pages — the legal ones, the settings screen — have no /it/ or /ru/ twin.
 * Declaring one anyway is not a harmless overshoot: it hands a crawler a URL
 * that answers 404, which is exactly what happened to /it/terms/.
 */
export const ROOT_ONLY: readonly Locale[] = ['en'];
