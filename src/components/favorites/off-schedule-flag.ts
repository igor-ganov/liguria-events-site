import { isDefined } from '../../lib/is-defined.ts';
import { officialWindow, timeOfMinutes } from '../../lib/favorites/day-schedule.ts';
import type { RouteStop } from '../../lib/favorites/build-route.ts';
import type { ScheduledStop } from '../../lib/favorites/day-schedule.ts';

/** When a block has drifted out of the event's official window, surface that
 *  real window as a hint; otherwise nothing. */
export const offScheduleFlag = (item: ScheduledStop, event: RouteStop | undefined): string =>
  [event]
    .filter(isDefined)
    .filter(() => item.offSchedule)
    .flatMap((e) => [officialWindow(e)])
    .filter(isDefined)
    .map((win) => `${timeOfMinutes(win.start)}–${timeOfMinutes(win.end)}`)
    .map((label) => `<span class="tl-flag" aria-label="Runs ${label}">${label}</span>`)
    .join('');
