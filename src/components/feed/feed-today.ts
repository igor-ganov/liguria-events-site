import { isoToday } from '../../lib/calendar/iso-today.ts';

/** The feed's "today" is the one the STATIC page was built with (stamped on the
 *  list as data-today), not the browser's clock. On a build that is a day old
 *  the two differ, and using the browser date made applyFeedFilter hide the
 *  whole first day-group the server had rendered — the events flashed in, then
 *  vanished on load ("the order arrives one way, then changes"). Reading the
 *  server's today keeps the initial client view identical to the SSR, so there
 *  is no reflow; a genuinely stale build is a content-freshness concern, handled
 *  by rebuild cadence, not a per-load flicker. Falls back to the clock when the
 *  attribute is absent (e.g. a client-only feed). */
export const feedToday = (): string =>
  document.querySelector('[data-feed-list]')?.getAttribute('data-today') || isoToday();
