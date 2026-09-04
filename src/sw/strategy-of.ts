import { isDefined } from '../lib/is-defined.ts';
import type { Strategy } from './strategy.ts';

/** The part of a Request the routing decision reads — a real Request fits it. */
export type SwRequest = Readonly<{ method: string; mode: string; url: string }>;

const NEVER: Strategy = 'network-only';

// Read in order, first match wins. The network-only prefixes come first so that
// a page under them stays server-rendered even though it is a navigation: they
// carry a session, a mutation, or content generated per request.
const PREFIXES: readonly (readonly [string, Strategy])[] = [
  ['/api/', NEVER],
  ['/auth/', NEVER],
  ['/admin/', NEVER],
  ['/og/', NEVER],
  ['/uploads/', NEVER],
  ['/_astro/', 'cache-first'],
  ['/font/', 'cache-first'],
  ['/fonts/', 'cache-first'],
  ['/sprite/', 'cache-first'],
  ['/icons/', 'cache-first'],
  ['/data/', 'stale-while-revalidate'],
];

const byPrefix = (path: string): Strategy | undefined =>
  PREFIXES.filter(([prefix]) => path.startsWith(prefix))
    .map(([, strategy]) => strategy)
    .at(0);

/**
 * Which strategy answers this request.
 *
 * Pages are network-first because this site is server-rendered: a cached page
 * is an event whose time, place or existence may have changed since. The cache
 * is a fallback for when there is no network at all, never a first answer.
 *
 * Anything unrecognised is left to the network. A service worker guessing at a
 * request it was not designed for is how a site starts serving yesterday.
 */
export const strategyOf = (request: SwRequest, origin: string): Strategy =>
  [
    ...[request].filter(({ method }) => method !== 'GET').map(() => NEVER),
    ...[new URL(request.url)].filter((url) => url.origin !== origin).map(() => NEVER),
    ...[byPrefix(new URL(request.url).pathname)].filter(isDefined),
    ...[request].filter(({ mode }) => mode === 'navigate').map((): Strategy => 'network-first'),
  ].at(0) ?? NEVER;
