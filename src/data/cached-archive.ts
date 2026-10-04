import { archivedEvents } from './archived-events.ts';
import { branch } from '../lib/branch.ts';
import type { ArchivedEvent } from '../lib/events/archived-schema.ts';

/** An hour. The archive only grows, and it grows when a date passes — a record
 *  that left the feed this morning is not news, and every venue page reads a
 *  quarter of a megabyte of it. */
const TTL_MS = 60 * 60 * 1000;

let cache: Promise<readonly ArchivedEvent[]> | undefined;
let fetchedAt = 0;

const refresh = (url: string, now: number): Promise<readonly ArchivedEvent[]> => {
  cache = archivedEvents(url);
  fetchedAt = now;
  return cache;
};

/** Everything that has been and gone, shared like the corpus: one fetch per
 *  isolate per hour, and an unreachable archive costs a page its past rather
 *  than the page. */
export const cachedArchive = (url: string): Promise<readonly ArchivedEvent[]> => {
  const now = Date.now();
  const cached = cache;
  return branch(cached !== undefined && now - fetchedAt <= TTL_MS)(
    () => cached ?? refresh(url, now),
    () => refresh(url, now),
  );
};
