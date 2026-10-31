import { branch } from '../lib/branch.ts';
import { loadHolidays } from './load-holidays.ts';
import type { HolidaysPayload } from '../lib/holidays/decode-holidays.ts';

// Every page of a build asks, and so does every SSR request: one fetch, shared,
// renewed after five minutes so a long-lived isolate picks up the job's next
// decision (the same reasoning as cached-events.ts).
const TTL_MS = 5 * 60 * 1000;

let cache: Promise<HolidaysPayload> | undefined;
let fetchedAt = 0;

const refresh = (url: string, now: number): Promise<HolidaysPayload> => {
  cache = loadHolidays(url);
  fetchedAt = now;
  return cache;
};

/** The holidays payload, fetched at most once per five minutes. */
export const cachedHolidays = (url: string): Promise<HolidaysPayload> => {
  const now = Date.now();
  const cached = cache;
  return branch(cached !== undefined && now - fetchedAt <= TTL_MS)(
    () => cached ?? refresh(url, now),
    () => refresh(url, now),
  );
};
