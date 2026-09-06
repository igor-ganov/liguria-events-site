import { isCacheablePage } from './is-cacheable-page.ts';
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
  // The offline page's own script. Precached with the page, and useless
  // unless the worker also SERVES it: left to the network it is fetched from
  // a connection that by definition is not there, and the page that was meant
  // to offer what is readable offers nothing.
  ['/offline.js', 'cache-first'],
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
 * Pages come from the device first. A navigation that waits for a server is a
 * navigation that waits for the worst connection its reader has ever had, and
 * on this site it waits for a page of a megabyte. The copy is shown at once,
 * the network is asked behind it, and the reader is told how old what they are
 * looking at is — which is what makes serving a stored page acceptable rather
 * than a quiet lie.
 *
 * Anything unrecognised is left to the network. A service worker guessing at a
 * request it was not designed for is how a site starts serving yesterday.
 */
export const strategyOf = (request: SwRequest, origin: string): Strategy =>
  [
    ...[request].filter(({ method }) => method !== 'GET').map(() => NEVER),
    ...[new URL(request.url)].filter((url) => url.origin !== origin).map(() => NEVER),
    ...[byPrefix(new URL(request.url).pathname)].filter(isDefined),
    // A navigation to a page that belongs to everybody. The two rules are the
    // same rule: what may be SERVED from the device is what may be KEPT on it,
    // and asking isCacheablePage here rather than repeating its list is what
    // stops them drifting into disagreeing about /submit/.
    ...[request]
      .filter(({ mode }) => mode === 'navigate')
      .filter(({ url }) => isCacheablePage(new URL(url).pathname))
      .map((): Strategy => 'page-first'),
  ].at(0) ?? NEVER;
