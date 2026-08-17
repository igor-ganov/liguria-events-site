import { beginDrag } from './begin-drag.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isElement } from './is-element.ts';
import type { DragState } from './drag-types.ts';

/** Shell: a press inside a block starts a gesture — except on its buttons,
 *  which take their own clicks. */
export const onTimelinePointerDown = (state: DragState, event: PointerEvent): void => {
  const target = [event.target].filter(isElement).at(0);
  [target?.closest<HTMLElement>('.tl-block') ?? undefined]
    .filter(isDefined)
    .filter(() => !target?.closest('button'))
    .forEach((block) => beginDrag(state, block, target, event));
};
