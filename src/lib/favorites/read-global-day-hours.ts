import { DEFAULT_DAY_HOURS } from './default-day-hours.ts';
import { GLOBAL_DAY_HOURS_KEY } from './global-day-hours-key.ts';
import { isDayHours } from './is-day-hours.ts';
import type { DayHours } from './day-hours-types.ts';

/** The trip-wide default day window, falling back to the built-in when unset,
 *  malformed, unreadable or blocked. */
export const readGlobalDayHours = (): DayHours => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(GLOBAL_DAY_HOURS_KEY) ?? '0');
    return (
      [raw]
        .filter(isDayHours)
        .map((hours) => ({ start: hours.start, end: hours.end }))
        .at(0) ?? DEFAULT_DAY_HOURS
    );
  } catch {
    return DEFAULT_DAY_HOURS;
  }
};
