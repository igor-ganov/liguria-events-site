import { branch } from '../../lib/branch.ts';
import type { PickMode } from './pick-mode.ts';

const same = (current: PickMode | undefined, next: PickMode): boolean =>
  current?.scope === next.scope && current?.kind === next.kind && current?.day === next.day;

/** Arming a base picker that is already armed disarms it — one button both
 *  starts and cancels "click the map to set this point". */
export const togglePick = (current: PickMode | undefined, next: PickMode): PickMode | undefined =>
  branch(same(current, next))<PickMode | undefined>(() => undefined, () => next);
