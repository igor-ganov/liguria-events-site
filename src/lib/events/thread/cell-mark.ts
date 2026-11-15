import type { CalendarCell, DayMark } from './calendar-types.ts';

type Day = Extract<CalendarCell, { kind: 'day' }>;

/** The mark a square of the calendar is drawn with; a blank has none, so the
 *  attribute is left off rather than written as "false". */
export const cellMark = (cell: CalendarCell): DayMark | undefined =>
  [cell]
    .filter((one): one is Day => one.kind === 'day')
    .map((one) => one.mark)
    .at(0);
