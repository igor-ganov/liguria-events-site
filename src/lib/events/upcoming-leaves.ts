import { branch } from '../branch.ts';
import type { ProgrammeLeaf } from './programme-leaves.ts';

/** The leaves from today on. When none are left the run is over, and the page
 *  of a past event shows the whole of it rather than an empty programme. */
export const upcomingLeaves = (leaves: readonly ProgrammeLeaf[], today: string): readonly ProgrammeLeaf[] => {
  const ahead = leaves.filter((leaf) => leaf.iso >= today);
  return branch(ahead.length === 0)(
    () => leaves,
    () => ahead,
  );
};
