import { dropEmptyDays } from './drop-empty-days.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

const same = (group: DayGroup): DayGroup => group;

/** Move a stop from one day to the end of another; a day left empty drops out.
 *  The source entry is registered last, so it wins when a stop is "moved" onto
 *  the day it is already on — the stop leaves rather than being duplicated. */
export const moveStopToDay = (
  groups: readonly DayGroup[],
  id: string,
  from: string,
  to: string,
): readonly DayGroup[] => {
  const ops = new Map<string, (group: DayGroup) => DayGroup>([
    [to, (group) => ({ ...group, ids: [...group.ids, id] })],
    [from, (group) => ({ ...group, ids: group.ids.filter((x) => x !== id) })],
  ]);
  return dropEmptyDays(groups.map((group) => (ops.get(group.day) ?? same)(group)));
};
