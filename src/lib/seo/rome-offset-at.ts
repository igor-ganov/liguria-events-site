import { romeOffset } from './rome-offset.ts';
import { shiftDay } from '../calendar/shift-day.ts';

const LOCAL = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// Whether `offset` puts the wall-clock time on Rome's clock, read back through
// the platform's tz database.
const shows = (date: string, time: string) => (offset: string): boolean =>
  LOCAL.format(new Date(`${date}T${time}:00${offset}`)) === `${date}, ${time}`;

/**
 * Italy's UTC offset at a wall-clock time on a day — `+02:00` or `+01:00`.
 *
 * The day's offset at noon is wrong for the small hours of the two days the
 * clocks change: a 01:30 start on 25 October is still summer time, a 01:00
 * start on 28 March still winter time. The offsets on either side of the day
 * are tried in turn: the earlier wins the hour that happens twice, and the hour
 * that never happens (02:30 in spring) is read in the later one.
 */
export const romeOffsetAt = (date: string, time: string): string => {
  const before = romeOffset(shiftDay(date, -1));
  const after = romeOffset(shiftDay(date, 1));
  return [before, after].find(shows(date, time)) ?? after;
};
