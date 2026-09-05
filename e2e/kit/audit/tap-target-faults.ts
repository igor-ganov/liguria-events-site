import { isRendered } from './is-rendered.ts';
import type { Box } from './box.ts';

const tooSmall = (minimum: number) => (box: Box): string =>
  `${box.label} is ${Math.round(box.width)}×${Math.round(box.height)}, under the ${minimum}px minimum`;

/**
 * Controls too small to hit with a thumb.
 *
 * WCAG 2.2 sets the minimum at 24×24 CSS pixels and exempts targets that sit
 * in a line of text — a link inside a sentence cannot be made 24px tall
 * without wrecking the paragraph around it.
 */
export const tapTargetFaults = (minimum: number, boxes: readonly Box[]): readonly string[] =>
  boxes
    .filter(isRendered)
    .filter((box) => !box.inline)
    // Rounded before it is judged, and judged on the same number the message
    // prints. Sub-pixel geometry routinely lands a control at 23.99, and a
    // rule that fails that while reporting "24" cannot be acted on.
    .filter((box) => Math.round(box.width) < minimum || Math.round(box.height) < minimum)
    .map(tooSmall(minimum));
