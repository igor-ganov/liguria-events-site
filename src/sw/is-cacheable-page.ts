// Never kept. Everything here is rendered for one person, carries a draft or
// an address, or is not a page at all — and this cache is shared by everyone
// who picks up the device.
const PRIVATE = ['/api/', '/auth/', '/og/', '/uploads/', '/admin'];
const PERSONAL = ['/submit/', '/settings/'];
const LOCALES = ['/it', '/ru'];

/** The path as a folder, so the rules below need not care whether the site
 *  wrote the trailing slash — it links to `/submit`, it redirects to
 *  `/submit/`, and both are the same page belonging to the same person. */
const asFolder = (path: string): string => `${path.split('?')[0]?.replace(/\/+$/, '') ?? path}/`;

/** The path with a language prefix taken off, so one rule covers all three. */
const unlocalized = (path: string): string =>
  LOCALES.filter((locale) => path.startsWith(`${locale}/`))
    .map((locale) => path.slice(locale.length))
    .at(0) ?? path;

/**
 * Whether a page may be kept for a reader who has no signal.
 *
 * The rule is about who the page belongs to, not about how fresh it is: a
 * region feed, a calendar and an event page are the same for everybody, and a
 * reader on a train would rather have yesterday's than nothing. Anything
 * rendered for one person is left to the network, where it can be refused.
 */
export const isCacheablePage = (path: string): boolean => {
  const bare = asFolder(unlocalized(path));
  return (
    !PRIVATE.some((prefix) => bare.startsWith(prefix)) &&
    !PERSONAL.some((prefix) => bare.startsWith(prefix)) &&
    !bare.includes('/edit/')
  );
};
