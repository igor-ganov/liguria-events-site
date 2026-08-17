import { editorState } from './editor-state.ts';
import { nextDayHours } from './next-day-hours.ts';
import { renderEditor } from './render-editor.ts';

/** Shell: a per-day window override set on a timeline day header. */
export const setEditorDayHours = (day: string, changed: HTMLInputElement): void => {
  const box = changed.closest('.tl-day-hours') ?? document;
  const dayHours = nextDayHours(
    editorState.payload.dayHours,
    day,
    box.querySelector<HTMLInputElement>('[data-day-start]')?.value ?? '',
    box.querySelector<HTMLInputElement>('[data-day-end]')?.value ?? '',
  );
  editorState.payload = { ...editorState.payload, dayHours };
  renderEditor();
};
