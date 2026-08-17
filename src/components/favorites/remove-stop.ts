import { branch } from '../../lib/branch.ts';
import { dropEmptyDays } from './drop-empty-days.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Take one stop out of one day of the route. */
export const removeStop = (
  groups: readonly DayGroup[],
  id: string,
  day: string,
): readonly DayGroup[] =>
  dropEmptyDays(
    groups.map((group) =>
      branch(group.day === day)<DayGroup>(
        () => ({ ...group, ids: group.ids.filter((x) => x !== id) }),
        () => group,
      ),
    ),
  );
