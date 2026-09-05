import { isRendered } from './is-rendered.ts';
import type { Box } from './box.ts';

/** Sub-pixel geometry lands a hair past the edge on some densities. Failing on
 *  that would make a layout spec a coin toss on a different device. */
const TOLERANCE = 1;

const past = (viewport: number) => (box: Box): string =>
  `${box.label} runs from ${Math.round(box.left)} to ${Math.round(box.right)} in a ${viewport}px viewport`;

/**
 * Anything reaching outside the viewport sideways.
 *
 * A page that scrolls horizontally is the most common way a phone layout
 * breaks, and the most invisible: on a desktop run everything fits.
 */
export const overflowFaults = (viewport: number, boxes: readonly Box[]): readonly string[] =>
  boxes
    .filter(isRendered)
    .filter((box) => !box.scrollable)
    .filter((box) => box.right > viewport + TOLERANCE || box.left < -TOLERANCE)
    .map(past(viewport));
