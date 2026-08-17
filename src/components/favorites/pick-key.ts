import type { PickKey, PickMode } from './pick-mode.ts';

// Scope decides first: only a DAY pick distinguishes base from final point.
const KEYS: Readonly<Record<PickMode['scope'], Readonly<Record<PickMode['kind'], PickKey>>>> = {
  global: { base: 'global', final: 'global' },
  route: { base: 'route', final: 'route' },
  day: { base: 'day-base', final: 'day-final' },
};

/** What an armed picker writes to when the map is clicked. */
export const pickKey = (pick: PickMode): PickKey => KEYS[pick.scope][pick.kind];
