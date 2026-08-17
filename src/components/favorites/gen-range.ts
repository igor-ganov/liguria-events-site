import { dateRange } from './date-range.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import type { DateRange } from '../../lib/favorites/build-route.ts';

/** Shell: the trip window the two date inputs currently ask for; an empty start
 *  means today, an empty end means an open-ended trip. */
export const genRange = (): DateRange =>
  dateRange(
    document.querySelector<HTMLInputElement>('[data-route-from]')?.value || isoToday(),
    document.querySelector<HTMLInputElement>('[data-route-to]')?.value || undefined,
  );
