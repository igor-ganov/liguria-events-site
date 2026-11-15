import type { ProgrammeLeaf } from '../programme-leaves.ts';

const MOST = 8;

/**
 * The sessions the page lists by name. Under a month calendar, sessions that
 * all carry one name ("Knitting meeting", every Thursday) would only say the
 * calendar again; sessions with names of their own are what a reader picks
 * between, so they are listed — the first eight still to come.
 */
export const listedLeaves = (leaves: readonly ProgrammeLeaf[], calendar: boolean): readonly ProgrammeLeaf[] => {
  const named = new Set(leaves.map((leaf) => leaf.title).filter((title) => title !== undefined)).size > 1;
  return leaves.filter(() => !calendar || named).slice(0, MOST);
};
