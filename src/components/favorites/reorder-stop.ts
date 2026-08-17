import { branch } from '../../lib/branch.ts';
import { swapInDay } from './swap-in-day.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Nudge a stop up or down within its day (the ▲ / ▼ buttons). */
export const reorderStop = (
  groups: readonly DayGroup[],
  id: string,
  day: string,
  delta: number,
): readonly DayGroup[] =>
  groups.map((group) =>
    branch(group.day === day)<DayGroup>(
      () => swapInDay(group, id, delta),
      () => group,
    ),
  );
