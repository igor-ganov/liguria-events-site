import { branch } from '../../lib/branch.ts';
import { editorState } from './editor-state.ts';
import { renderEditor } from './render-editor.ts';
import { writeGlobalDayHours } from '../../lib/favorites/day-hours.ts';

const valueOf = (selector: string): string =>
  document.querySelector<HTMLInputElement>(selector)?.value ?? '';

/** Shell: the route-level day window; "set as default" also persists it as the
 *  traveller's global window. */
export const setRouteDayHours = (): void => {
  const start = valueOf('[data-route-day-start]');
  const end = valueOf('[data-route-day-end]');
  editorState.payload = { ...editorState.payload, dayStart: start, dayEnd: end };
  const asDefault =
    document.querySelector<HTMLInputElement>('[data-route-day-default]')?.checked === true;
  branch(asDefault && start !== '' && end !== '')<void>(
    () => writeGlobalDayHours({ start, end }),
    () => undefined,
  );
  renderEditor();
};
