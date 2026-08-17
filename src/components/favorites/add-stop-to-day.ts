import { branch } from '../../lib/branch.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Append a favourite to the end of one day of the route. */
export const addStopToDay = (
  groups: readonly DayGroup[],
  id: string,
  day: string,
): readonly DayGroup[] =>
  groups.map((group) =>
    branch(group.day === day)<DayGroup>(
      () => ({ ...group, ids: [...group.ids, id] }),
      () => group,
    ),
  );
