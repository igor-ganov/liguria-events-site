// When a day starts and ends, resolvable at three levels — per-day override,
// this route's setting, a global default kept in localStorage — falling back to
// a built-in. The timeline auto-schedules from the day start and bounds its axis
// by the day end. Precedence: day > route > global > default.
export type DayHours = Readonly<{ start: string; end: string }>; // "HH:MM"
