import { setEditorDayHours } from './set-editor-day-hours.ts';
import { setEditorDuration } from './set-editor-duration.ts';
import { setRouteDayHours } from './set-route-day-hours.ts';

const MIN_DUR = 15;

type InputAction = Readonly<{
  match: (input: HTMLInputElement) => boolean;
  run: (input: HTMLInputElement) => void;
}>;

const ACTIONS: readonly InputAction[] = [
  {
    match: (input) => input.hasAttribute('data-dur-input'),
    run: (input) =>
      setEditorDuration(
        input.dataset['durId'] ?? '',
        Math.max(MIN_DUR, Math.round(Number(input.value) || 0)),
      ),
  },
  {
    match: (input) => input.hasAttribute('data-day-start') || input.hasAttribute('data-day-end'),
    run: (input) => setEditorDayHours(input.dataset['day'] ?? '', input),
  },
  {
    match: (input) =>
      input.hasAttribute('data-route-day-start') || input.hasAttribute('data-route-day-end'),
    run: () => setRouteDayHours(),
  },
];

/** Shell: the editor's <input> changes — a duration, a per-day window, or the
 *  route-level window. The first matching rule wins. */
export const runInputChange = (input: HTMLInputElement): void => {
  ACTIONS.filter((action) => action.match(input))
    .slice(0, 1)
    .forEach((action) => action.run(input));
};
