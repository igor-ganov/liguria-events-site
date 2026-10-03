import { isLocale } from './is-locale.ts';
import type { Locale } from './locales.ts';

/** A front door: the language it already names, if any, and the page it asks
 *  for inside a region. */
export type BareEntry = Readonly<{ lang: Locale | undefined; page: string }>;

// The pages a reader can ask for without naming a region. Everything else is an
// address in its own right.
const PAGES: Readonly<Record<string, string>> = { '': '', calendar: 'calendar/', map: 'map/' };

const parts = (pathname: string): readonly string[] =>
  pathname.split('/').filter((part) => part !== '');

/**
 * Whether an address is a front door, and which one.
 *
 * `/`, `/calendar`, `/map` and their language-prefixed twins name no region, so
 * a region has to be chosen for them. They used to be rewritten in
 * public/_redirects, which cannot read a header and so sent every reader to the
 * same region — the one the site was founded in.
 */
export const bareEntry = (pathname: string): BareEntry | undefined => {
  const [first, ...rest] = parts(pathname);
  const lang = [first].filter(isLocale).at(0);
  const page = [...[first].filter(() => lang === undefined), ...rest].at(0) ?? '';
  const target = PAGES[page];
  return [target]
    .filter((found): found is string => found !== undefined)
    .filter(() => rest.length <= Number(lang !== undefined))
    .map((found) => ({ lang, page: found }))
    .at(0);
};
