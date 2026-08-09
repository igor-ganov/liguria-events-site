// When a day starts and ends, resolvable at three levels — per-day override,
// this route's setting, a global default kept in localStorage — falling back to
// a built-in. The timeline auto-schedules from the day start and bounds its axis
// by the day end. Precedence: day > route > global > default.
export type DayHours = Readonly<{ start: string; end: string }>; // "HH:MM"

export const DEFAULT_DAY_HOURS: DayHours = { start: '09:00', end: '22:00' };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const isHours = (v: unknown): v is DayHours =>
  Boolean(v) &&
  typeof v === 'object' &&
  TIME_RE.test(String(Reflect.get(Object(v), 'start'))) &&
  TIME_RE.test(String(Reflect.get(Object(v), 'end')));

export const effectiveDayHours = (
  day: string,
  perDay: Readonly<Record<string, DayHours>>,
  route: DayHours | undefined,
  global: DayHours | undefined,
): DayHours => perDay[day] ?? route ?? global ?? DEFAULT_DAY_HOURS;

const GLOBAL_KEY = 'dovego:day-hours';

export const readGlobalDayHours = (): DayHours => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(GLOBAL_KEY) ?? '0');
    return isHours(raw) ? { start: raw.start, end: raw.end } : DEFAULT_DAY_HOURS;
  } catch {
    return DEFAULT_DAY_HOURS;
  }
};

export const writeGlobalDayHours = (hours: DayHours): void => {
  try {
    if (isHours(hours)) localStorage.setItem(GLOBAL_KEY, JSON.stringify({ start: hours.start, end: hours.end }));
  } catch {
    /* storage blocked — ignore */
  }
};
