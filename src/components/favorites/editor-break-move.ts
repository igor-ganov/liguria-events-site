import { breakAnchorAt } from './break-anchor-at.ts';
import { buildDaySchedule } from '../../lib/favorites/day-schedule.ts';
import { editorDayWindow } from './editor-day-window.ts';
import { editorState } from './editor-state.ts';
import { movePause } from './move-pause.ts';
import { setEditorPauses } from './set-editor-pauses.ts';
import { stopsOfGroups } from './stops-of-groups.ts';

/** Shell: a break dragged to another gap — re-anchor it to the stop whose slot
 *  it was dropped into. The schedule is read WITHOUT breaks, so the anchors are
 *  the stops' own slots. */
export const editorBreakMove = (anchor: string, day: string, startMin: number): void => {
  const { payload, byId } = editorState;
  const schedule = buildDaySchedule(
    stopsOfGroups(payload.groups, day, byId),
    payload.mode,
    payload.times,
    payload.durations,
    {},
    editorDayWindow(day).startMin,
  );
  setEditorPauses(movePause(payload.pauses, anchor, breakAnchorAt(schedule, startMin) ?? anchor));
};
