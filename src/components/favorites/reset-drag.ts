import { isDefined } from '../../lib/is-defined.ts';
import type { DragState } from './drag-types.ts';

/** Shell: let go of the block and clear every visual trace of the gesture. */
export const resetDrag = (state: DragState): void => {
  [state.drag].filter(isDefined).forEach((finished) => {
    state.drag = undefined;
    finished.el.classList.remove('tl-block--dragging', 'tl-block--will-delete');
    finished.axis.classList.remove('tl-axis--dragging');
    finished.el.style.transform = '';
  });
};
