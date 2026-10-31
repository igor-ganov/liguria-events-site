import { cachedHolidays } from '../data/cached-holidays.ts';
import { HOLIDAYS_URL } from '../data/holidays-url.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { upcomingHolidays } from '../lib/holidays/upcoming-holidays.ts';
import type { Holiday } from '../lib/holidays/decode-holidays.ts';

/** The holidays a page is ready to dress for — at build time for the static
 *  feeds, per request for SSR pages. Which one is on is decided in the browser. */
export const pageHolidays = (): Promise<readonly Holiday[]> =>
  cachedHolidays(HOLIDAYS_URL).then(({ holidays }) => upcomingHolidays(holidays, isoToday()));
