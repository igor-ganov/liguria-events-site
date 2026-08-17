import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';
import { timeOfMinutes } from '../../lib/favorites/day-schedule.ts';

/** Shell: a top-edge drag pins the stop's start AND sets its length. */
export const editorPinTop = (id: string, _day: string, startMin: number, durMin: number): void => {
  const { payload } = editorState;
  editorState.payload = {
    ...payload,
    times: { ...payload.times, [id]: timeOfMinutes(startMin) },
    durations: { ...payload.durations, [id]: durMin },
  };
  renderEditor();
};
