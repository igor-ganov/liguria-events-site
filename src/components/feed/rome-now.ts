import { isoToday } from '../../lib/calendar/iso-today.ts';
import type { RomeNow } from '../../lib/quick/quick-window.ts';

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Rome',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Shell (time is a side effect): today and the minute of the day in Rome,
 *  read when a quick filter is pressed — the feed page itself is static. */
export const romeNow = (): RomeNow => {
  const [hours = 0, minutes = 0] = CLOCK.format(new Date()).split(':').map(Number);
  return { day: isoToday(), minute: hours * 60 + minutes };
};
