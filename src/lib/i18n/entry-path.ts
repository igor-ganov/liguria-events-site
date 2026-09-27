import { branch } from '../branch.ts';
import { DEFAULT_REGION } from '../region/default-region.ts';
import { preferredLocale } from './preferred-locale.ts';
import { regionUrl } from '../region/region-url.ts';

/**
 * Where the front door leads, or undefined for every other address.
 *
 * The site has no page at "/", and which region and language it opens on are
 * both decisions rather than facts — so this is a 302, and it depends on the
 * reader's Accept-Language, which is why it cannot live in public/_redirects.
 */
export const entryPath = (
  pathname: string,
  acceptLanguage: string | undefined,
): string | undefined =>
  branch(['', '/'].includes(pathname))(
    () => regionUrl(preferredLocale(acceptLanguage), DEFAULT_REGION),
    () => undefined,
  );
