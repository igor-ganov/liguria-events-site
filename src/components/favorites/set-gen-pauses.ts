import { GEN_KEYS } from './gen-keys.ts';
import { genState } from './gen-state.ts';
import { paintRoute } from './paint-route.ts';
import { writeJsonStore } from './write-json-store.ts';
import type { Durations } from '../../lib/favorites/day-schedule.ts';

/** Shell: adopt a new set of manual breaks, persist it (so a regenerate keeps
 *  them and a save embeds them) and repaint. */
export const setGenPauses = (pauses: Durations): void => {
  genState.pauses = pauses;
  writeJsonStore(GEN_KEYS.pauses, pauses);
  paintRoute(genState.days);
};
