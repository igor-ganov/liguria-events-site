import { decodeEventList } from './decode-event-list.ts';
import type { CompactEvent } from './event-schema.ts';

/**
 * One event from the collector's archive, for an id the build corpus no longer
 * carries — the corpus holds only what is still to come.
 *
 * A failed or malformed answer yields nothing, so the page falls through to its
 * own not-found rather than throwing: an archive outage must not turn every
 * event link into a 500.
 */
export const archivedEvent = async (
  eventsUrl: string,
  id: string,
): Promise<CompactEvent | undefined> => {
  const base = eventsUrl.replace(/\/events\.json.*$/, '');
  // Started inside a promise chain, so a synchronous throw — a malformed base
  // URL, say — becomes a rejection the catch below handles like any other.
  const parsed: unknown = await Promise.resolve()
    .then(() => fetch(`${base}/event/${id}`, { headers: { accept: 'application/json' } }))
    .then((res) => [res].filter((answer) => answer.ok).map((answer) => answer.json()).at(0))
    .catch(() => undefined);
  return decodeEventList([parsed].filter((value) => value !== undefined)).at(0);
};
