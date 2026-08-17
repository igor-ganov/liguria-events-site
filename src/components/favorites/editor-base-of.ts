import { editorState } from './editor-state.ts';
import { readGlobalBase, resolveDayBase } from '../../lib/favorites/base-point.ts';
import type { DayBase } from '../../lib/favorites/base-point.ts';

/** Shell: a day's base and final point — day override, then this route's, then
 *  the traveller's global default. */
export const editorBaseOf = (day: string): DayBase => {
  const { dayBases, base, dayFinals } = editorState.payload;
  return resolveDayBase(day, dayBases, base, readGlobalBase(), dayFinals);
};
