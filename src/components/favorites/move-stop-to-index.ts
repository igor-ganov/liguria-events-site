import { branch } from '../../lib/branch.ts';
import { insertAtIndex } from './insert-at-index.ts';
import type { DayGroup } from '../../lib/favorites/build-route.ts';

/** Move a stop to an absolute index within its day — the timeline's
 *  drag-to-reorder commit. */
export const moveStopToIndex = (
  groups: readonly DayGroup[],
  id: string,
  day: string,
  index: number,
): readonly DayGroup[] =>
  groups.map((group) =>
    branch(group.day === day)<DayGroup>(
      () => insertAtIndex(group, id, index),
      () => group,
    ),
  );
