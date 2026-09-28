// Six hours: the site rebuilds every six (deploy.yml's schedule), so a copy
// older than that is a copy of a different site. Short enough that a stored
// page is never a stale app, long enough that nobody waits twice in a visit.
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * Whether a stored page may still be shown as the site.
 *
 * Page-first exists so no navigation waits for a server, and the bar tells the
 * reader what they are looking at — but neither of those makes a three-week-old
 * copy the site. Measured on a device on 2026-09-28: a page stored on 2026-09-08
 * was served with a connection present, referring to scripts the server had long
 * since replaced, so the reader was running a three-week-old app and every
 * client-side change shipped since — instrumentation included — was invisible.
 *
 * Past the ceiling the network is awaited instead. Nothing is lost when it fails:
 * the stored copy is still served, and still says how old it is.
 */
export const freshEnough = (storedMs: number, nowMs: number): boolean =>
  storedMs > 0 && nowMs - storedMs < MAX_AGE_MS;
