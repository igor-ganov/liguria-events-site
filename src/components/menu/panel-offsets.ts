import { branch } from '../../lib/branch.ts';
import type { Corner } from './corner.ts';

/** The four inset properties that pin the popup beside its button. */
export type PanelOffsets = Readonly<{ left: string; right: string; top: string; bottom: string }>;

/** The popup hangs off the parked button: flush with the same two edges, and
 *  pushed clear of the button itself on the axis it opens along. */
export const panelOffsets = (corner: Corner, edge: string, clear: string): PanelOffsets => {
  const right = corner.endsWith('right');
  const bottom = corner.startsWith('bottom');
  return {
    left: branch(right)(
      () => 'auto',
      () => edge,
    ),
    right: branch(right)(
      () => edge,
      () => 'auto',
    ),
    top: branch(bottom)(
      () => 'auto',
      () => clear,
    ),
    bottom: branch(bottom)(
      () => clear,
      () => 'auto',
    ),
  };
};
