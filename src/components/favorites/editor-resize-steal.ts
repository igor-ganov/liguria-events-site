import { editorState } from './editor-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { renderEditor } from './render-editor.ts';
import { stealDurations } from './steal-durations.ts';
import { stopsOfGroups } from './stops-of-groups.ts';

/** Shell: a timeline edge-drag — grow the stop by stealing minutes from the
 *  stops that follow (they shrink, they are not shoved later); shrinking just
 *  sets it and the rest of the day flows up. */
export const editorResizeSteal = (id: string, day: string, newDur: number): void => {
  const { payload, byId } = editorState;
  const stops = stopsOfGroups(payload.groups, day, byId);
  [stealDurations(stops, id, newDur, payload.durations)]
    .filter(isDefined)
    .forEach((durations) => {
      editorState.payload = { ...editorState.payload, durations };
      renderEditor();
    });
};
