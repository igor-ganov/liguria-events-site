import type { CalendarCell, CalendarMonth, DayMark } from './calendar-types.ts';

const BLANK: CalendarCell = { kind: 'blank' };

const utc = (month: string, day: number): Date => new Date(`${month}-${String(day).padStart(2, '0')}T00:00:00Z`);

// Monday is the first column, as on an Italian wall calendar.
const mondayOffset = (month: string): number => (utc(month, 1).getUTCDay() + 6) % 7;

const lengthOf = (month: string): number => {
  const [year = 0, number = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number, 0)).getUTCDate();
};

const weeksOf = (cells: readonly CalendarCell[]): readonly (readonly CalendarCell[])[] =>
  Array.from({ length: Math.ceil(cells.length / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, column) => cells[week * 7 + column] ?? BLANK),
  );

/** One month as weeks of seven squares, each day marked by `markOf`. */
export const monthGrid =
  (markOf: (iso: string) => DayMark) =>
  (month: string): CalendarMonth => {
    const days = Array.from({ length: lengthOf(month) }, (_, index): CalendarCell => {
      const iso = `${month}-${String(index + 1).padStart(2, '0')}`;
      return { kind: 'day', iso, day: index + 1, mark: markOf(iso) };
    });
    const lead = Array.from({ length: mondayOffset(month) }, () => BLANK);
    return { month, weeks: weeksOf([...lead, ...days]) };
  };
