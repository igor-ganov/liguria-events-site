import { shiftDay } from '../calendar/shift-day.ts';
import type { QuickKind } from './quick-kind.ts';

/** The moment a quick filter is pressed, in Rome: the day and minutes since
 *  midnight. */
export type RomeNow = Readonly<{ day: string; minute: number }>;

/** The days a quick filter covers, and on which of them only the hours from a
 *  given minute count. `untimed` says whether an event with no hour counts on
 *  such a day. */
export type QuickWindow = Readonly<{
  from: string;
  to: string;
  cutoffs: Readonly<Record<string, number>>;
  untimed: boolean;
}>;

const EVENING = 18 * 60;
const SUNDAY_EVENING = 17 * 60;

const weekdayOf = (day: string): number => new Date(`${day}T12:00:00Z`).getUTCDay(); // 0 Sun … 6 Sat

const windowOf = (from: string, to: string, cutoff: number, untimed: boolean): QuickWindow => ({
  from,
  to,
  cutoffs: { [from]: cutoff },
  untimed,
});

// By weekday (0 Sun … 6 Sat): how far ahead the weekend starts, how many days
// it then runs, and from when on its first day. Friday evening on weekdays;
// from now on, once the weekend has begun.
const WEEKEND_AHEAD = [0, 4, 3, 2, 1, 0, 0] as const;
const WEEKEND_DAYS = [0, 2, 2, 2, 2, 2, 1] as const;
const fromNow = (minute: number): number => minute;
const fromEvening = (): number => EVENING;
const WEEKEND_FROM = [fromNow, fromEvening, fromEvening, fromEvening, fromEvening, fromEvening, fromNow] as const;

const STRATEGIES: Readonly<Record<QuickKind, (now: RomeNow) => QuickWindow>> = {
  tonight: ({ day }) => windowOf(day, day, EVENING, false),
  sunday: ({ day }) => {
    const sunday = shiftDay(day, (7 - weekdayOf(day)) % 7);
    return windowOf(sunday, sunday, SUNDAY_EVENING, false);
  },
  weekend: ({ day, minute }) => {
    const weekday = weekdayOf(day);
    const start = shiftDay(day, WEEKEND_AHEAD[weekday] ?? 0);
    const cutoff = (WEEKEND_FROM[weekday] ?? fromNow)(minute);
    return windowOf(start, shiftDay(start, WEEKEND_DAYS[weekday] ?? 0), cutoff, true);
  },
};

/** What a quick filter means at the moment it is pressed. */
export const quickWindow = (kind: QuickKind, now: RomeNow): QuickWindow => STRATEGIES[kind](now);
