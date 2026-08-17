import { buildDaySchedule } from '../../lib/favorites/day-schedule.ts';
import { editorDayWindow } from './editor-day-window.ts';
import { editorState } from './editor-state.ts';
import { flowStartMin } from './flow-start-min.ts';
import { moveStopToIndex } from './route-edit-ops.ts';
import { omitKey } from './omit-key.ts';
import { renderEditor } from './render-editor.ts';
import { stopsOfGroups } from './stops-of-groups.ts';
import { timesAfterMove } from './times-after-move.ts';

/** Shell: a timeline drag-to-reorder — put the stop at the drop index, and pin
 *  it to the drop time ONLY if that leaves a real gap before it. Dropping at or
 *  above its natural slot is a plain reorder, with no spurious pin. */
export const applyEditorMove = (id: string, day: string, index: number, startMin: number): void => {
  const { payload, byId } = editorState;
  const groups = moveStopToIndex(payload.groups, id, day, index);
  const unpinned = omitKey(payload.times, id);
  const schedule = buildDaySchedule(
    stopsOfGroups(groups, day, byId),
    payload.mode,
    unpinned,
    payload.durations,
    payload.pauses,
    editorDayWindow(day).startMin,
  );
  const times = timesAfterMove(payload.times, id, startMin, flowStartMin(schedule, id, startMin));
  editorState.payload = { ...payload, groups, times };
  renderEditor();
};
