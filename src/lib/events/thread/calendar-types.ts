/** How a day of a run's calendar is drawn: a session that has gone (crossed
 *  out), the next one (filled), one still to come (ringed), or no session. */
export type DayMark = 'gone' | 'next' | 'on' | 'off';

/** One square of a month: a day of it, or the blank before the 1st or after
 *  the last that keeps the weekdays in their columns. */
export type CalendarCell = Readonly<{ kind: 'blank' }> | Readonly<{ kind: 'day'; iso: string; day: number; mark: DayMark }>;

/** A month as weeks of seven squares, Monday first. `month` is 'YYYY-MM'. */
export type CalendarMonth = Readonly<{ month: string; weeks: readonly (readonly CalendarCell[])[] }>;
