import { branch } from '../../lib/branch.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Re-seat a stop at an absolute index within its day. The index is clamped to
 *  the day's length after the stop is lifted out, so dropping past the end
 *  appends; a day the stop isn't on comes back unchanged. */
export const insertAtIndex = (group: DayGroup, id: string, index: number): DayGroup => {
  const without = group.ids.filter((x) => x !== id);
  const at = Math.max(0, Math.min(Math.round(index), without.length));
  return branch(without.length === group.ids.length)<DayGroup>(
    () => group,
    () => ({ ...group, ids: [...without.slice(0, at), id, ...without.slice(at)] }),
  );
};
