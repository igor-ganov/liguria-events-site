import { dayWindow } from './day-window.ts';
import { editorState } from './editor-state.ts';
import { effectiveDayHours, readGlobalDayHours } from '../../lib/favorites/day-hours.ts';
import { routeDayHours } from './route-day-hours.ts';

/** Shell: a day's effective window — per-day override, then this route's
 *  setting, then the traveller's global default, then the built-in. */
export const editorDayWindow = (day: string): Readonly<{ startMin: number; endMin: number }> => {
  const { payload } = editorState;
  const hours = effectiveDayHours(
    day,
    payload.dayHours,
    routeDayHours(payload),
    readGlobalDayHours(),
  );
  return dayWindow(hours);
};
