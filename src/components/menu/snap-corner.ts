import { branch } from '../../lib/branch.ts';
import type { Corner } from './corner.ts';
import type { Viewport } from './fab-xy.ts';

/** The corner a drag snaps to — the quadrant the pointer was released in. */
export const snapCorner = (x: number, y: number, view: Viewport): Corner => {
  const vertical = branch(y > view.height / 2)<'bottom' | 'top'>(
    () => 'bottom',
    () => 'top',
  );
  const horizontal = branch(x > view.width / 2)<'right' | 'left'>(
    () => 'right',
    () => 'left',
  );
  return `${vertical}-${horizontal}`;
};
