import { isLocale } from './is-locale.ts';

// The first segments that are not a language and never become one: the API, the
// owner's pages, the legal pages, the asset routes. A page of the site is
// content in a language; these are the machinery around it.
const RESERVED: readonly string[] = [
  'api',
  'admin',
  'auth',
  'data',
  'embed',
  'img',
  'og',
  'uploads',
  'settings',
  'tickets',
  'offline',
  'privacy',
  'terms',
  'content-policy',
  'delete-account',
  'route',
  '_astro',
  'fonts',
  'icons',
];

const named = (pathname: string): readonly string[] =>
  pathname.split('/').filter((part) => part !== '');

/**
 * Where an address from before the languages were evened out now lives.
 *
 * English used to be the site with no prefix — a whole duplicate tree of route
 * files at the root, mirroring `[lang]/`, which is why `/` could not be a page
 * and why "English" was never a landing anybody could link to. English has a
 * prefix now like the other two, so every address that was English is moved to
 * it: the content is the same content, which is what a 301 has to be able to
 * say.
 *
 * Nothing else moves. A language already names itself, the root is the door, a
 * file is not a page (`/liguria/rss.xml`, `/robots.txt`), and the machinery
 * listed above was never in a language at all.
 */
export const legacyLocalePath = (pathname: string): string | undefined =>
  [named(pathname)]
    .filter((parts) => parts.length > 0)
    .filter((parts) => !isLocale(parts[0] ?? ''))
    .filter((parts) => !RESERVED.includes(parts[0] ?? ''))
    .filter((parts) => !(parts.at(-1) ?? '').includes('.'))
    .map((parts) => `/en/${parts.join('/')}/`)
    .at(0);
