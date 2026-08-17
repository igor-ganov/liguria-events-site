import { branch } from '../../lib/branch.ts';
import { isDefined } from '../../lib/is-defined.ts';
import type { Gesture } from './drag-types.ts';

const BY_EDGE: Readonly<Record<string, Gesture>> = { top: 'resize-top' };

/** The gesture a pointer-down already commits to: an edge handle resizes, the
 *  grip moves, anything else waits for the pointer to declare an axis. */
export const initialGesture = (resizeEdge: string | undefined, hasGrip: boolean): Gesture =>
  [resizeEdge].filter(isDefined).map((edge) => BY_EDGE[edge] ?? 'resize-bottom').at(0) ??
  branch(hasGrip)<Gesture>(() => 'move', () => 'pending');
