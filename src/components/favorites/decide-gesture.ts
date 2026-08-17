import { branch } from '../../lib/branch.ts';
import type { Gesture } from './drag-types.ts';

const AXIS_MIN = 6; // px before a gesture's axis is decided

// Horizontal → swipe-to-delete. Vertical on the body → a move only with a
// mouse; on touch the browser scrolls (pan-y) so we don't hijack it.
const fromAxis = (dx: number, dy: number, mouse: boolean): Gesture =>
  branch(Math.abs(dx) > AXIS_MIN && Math.abs(dx) > Math.abs(dy))<Gesture>(
    () => 'swipe',
    () => branch(mouse && Math.abs(dy) > AXIS_MIN)<Gesture>(() => 'move', () => 'pending'),
  );

/** What the pointer is doing: a gesture already decided at pointer-down (grip
 *  or resize handle) stands; an undecided one waits for the axis to declare
 *  itself. */
export const decideGesture = (current: Gesture, dx: number, dy: number, mouse: boolean): Gesture =>
  branch(current === 'pending')<Gesture>(() => fromAxis(dx, dy, mouse), () => current);
