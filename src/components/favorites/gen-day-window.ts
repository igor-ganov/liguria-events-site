import { dayWindow } from './day-window.ts';
import { effectiveDayHours, readGlobalDayHours } from '../../lib/favorites/day-hours.ts';
import { genState } from './gen-state.ts';

/** Shell: a generated day's effective window — per-day override, else the
 *  traveller's global default (a generated route has no route-level window). */
export const genDayWindow = (day: string): Readonly<{ startMin: number; endMin: number }> =>
  dayWindow(effectiveDayHours(day, genState.dayHours, undefined, readGlobalDayHours()));
