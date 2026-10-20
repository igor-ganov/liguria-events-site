import { branch } from '../branch.ts';
import { canonicalUrl } from './canonical-url.ts';
import { rootUrl } from './root-url.ts';
import type { Locale } from '../i18n/locales.ts';

/**
 * What a page points its canonical at.
 *
 * A page in a language lives under that language's prefix. A page that is in no
 * language — the legal pages, which have one address and no translated twin —
 * lives at the root and must not claim a prefixed address it does not answer at.
 */
export const pageCanonical = (
  lang: Locale,
  path: string,
  site: URL | undefined,
  locales: readonly Locale[],
): string =>
  branch(locales.length === 0)(
    () => rootUrl(path, site),
    () => canonicalUrl(lang, path, site),
  );
