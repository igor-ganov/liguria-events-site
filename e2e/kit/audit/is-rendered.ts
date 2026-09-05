import type { Box } from './box.ts';

/** Whether the element occupies space at all. Nothing that does not is a
 *  layout fault, an unreachable target, or anything else worth reporting. */
export const isRendered = (box: Box): boolean => box.width > 0 && box.height > 0;
