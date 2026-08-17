import { isInputElement } from './is-input-element.ts';
import { setGenDayHours } from './set-gen-day-hours.ts';
import { setGenDuration } from './set-gen-duration.ts';

type ChangeAction = Readonly<{
  match: (input: HTMLInputElement) => boolean;
  run: (input: HTMLInputElement) => void;
}>;

const ACTIONS: readonly ChangeAction[] = [
  {
    match: (input) => input.hasAttribute('data-day-start') || input.hasAttribute('data-day-end'),
    run: setGenDayHours,
  },
  { match: (input) => input.hasAttribute('data-dur-input'), run: setGenDuration },
];

/** Shell: one delegated change listener — the day-window inputs on the timeline
 *  and the per-stop duration boxes. Anything else is ignored. */
export const onGenChange = (event: Event): void => {
  [event.target].filter(isInputElement).forEach((input) =>
    ACTIONS.filter((action) => action.match(input))
      .slice(0, 1)
      .forEach((action) => action.run(input)),
  );
};
