import { branch } from '../../lib/branch.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Swap a stop with the neighbour `delta` places away. A stop absent from the
 *  day, or a neighbour past either end, leaves the day untouched. */
export const swapInDay = (group: DayGroup, id: string, delta: number): DayGroup => {
  const from = group.ids.indexOf(id);
  const to = from + delta;
  return branch(from >= 0 && to >= 0 && to < group.ids.length)<DayGroup>(
    () => ({
      ...group,
      ids: group.ids.with(from, group.ids[to] ?? '').with(to, group.ids[from] ?? ''),
    }),
    () => group,
  );
};
