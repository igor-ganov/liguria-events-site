import { PX_PER_MIN } from './px-per-min.ts';
import { timeOfMinutes } from '../../lib/favorites/day-schedule.ts';

const HOUR = 60;

/** The clock ruler behind a day: one labelled line per whole hour, inclusive
 *  of both ends. */
export const hourLines = (start: number, end: number): string =>
  Array.from({ length: Math.floor((end - start) / HOUR) + 1 }, (_, i) => start + i * HOUR)
    .map(
      (m) =>
        `<div class="tl-hour" style="top:${(m - start) * PX_PER_MIN}px"><span>${timeOfMinutes(m)}</span></div>`,
    )
    .join('');
