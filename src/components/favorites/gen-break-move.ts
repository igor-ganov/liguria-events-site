import { breakAnchorAt } from './break-anchor-at.ts';
import { buildDaySchedule } from '../../lib/favorites/day-schedule.ts';
import { genDayWindow } from './gen-day-window.ts';
import { genState } from './gen-state.ts';
import { movePause } from './move-pause.ts';
import { setGenPauses } from './set-gen-pauses.ts';
import { stopsOfDay } from './stops-of-day.ts';

/** Shell: a break dragged to another gap — re-anchor it to the stop whose slot
 *  it was dropped into. The schedule is read WITHOUT breaks, so the anchors are
 *  the stops' own slots. */
export const genBreakMove = (anchor: string, day: string, startMin: number): void => {
  const schedule = buildDaySchedule(
    stopsOfDay(genState.days, day),
    genState.mode,
    genState.times,
    genState.durations,
    {},
    genDayWindow(day).startMin,
  );
  setGenPauses(movePause(genState.pauses, anchor, breakAnchorAt(schedule, startMin) ?? anchor));
};
