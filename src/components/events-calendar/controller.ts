import { addMonths } from '../../lib/calendar/add-months.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { monthKeyOf } from '../../lib/calendar/month-key-of.ts';
import { readEventsIsland } from '../shared/read-events-island.ts';
import type { CalendarHost } from './host.ts';

type HostState = Omit<CalendarHost, 'ctl'>;

/** Controller closure — the element's only stateful collaborator. */
export const makeCalendarController = (host: HostState): CalendarHost['ctl'] => ({
  init: (): void => {
    host.events = readEventsIsland();
    host.today = isoToday();
    host.monthKey = monthKeyOf(host.today);
  },
  prev: (): void => {
    host.monthKey = addMonths(host.monthKey, -1);
  },
  next: (): void => {
    host.monthKey = addMonths(host.monthKey, 1);
  },
});
