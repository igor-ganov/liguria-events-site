import { lastPress } from './last-press.ts';
import { pressTarget } from './press-target.ts';

const remember = (event: Event): void => {
  [pressTarget(event)].forEach((target) => {
    lastPress.current = target && { target, at: performance.now() };
  });
};

/** Remember every press, in the capture phase: before the control's own
 *  handler runs and starts whatever it starts. */
export const watchPresses = (): void => {
  document.addEventListener('click', remember, { capture: true });
  document.addEventListener('submit', remember, { capture: true });
};
