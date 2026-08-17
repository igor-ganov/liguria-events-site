import { isDefined } from '../../lib/is-defined.ts';
import type { PickMode } from './pick-mode.ts';

/** Which of a day's two pickers (base / final point) is currently armed, if
 *  either — that button renders pressed. */
export const armedDayKind = (
  pick: PickMode | undefined,
  day: string,
): PickMode['kind'] | undefined =>
  [pick]
    .filter(isDefined)
    .filter((armed) => armed.scope === 'day' && armed.day === day)
    .map((armed) => armed.kind)
    .at(0);
