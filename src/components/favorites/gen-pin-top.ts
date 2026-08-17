import { GEN_KEYS } from './gen-keys.ts';
import { genState } from './gen-state.ts';
import { paintRoute } from './paint-route.ts';
import { timeOfMinutes } from '../../lib/favorites/day-schedule.ts';
import { writeJsonStore } from './write-json-store.ts';

/** Shell: a top-edge drag pins the stop's start AND sets its length. */
export const genPinTop = (id: string, _day: string, startMin: number, durMin: number): void => {
  genState.times = { ...genState.times, [id]: timeOfMinutes(startMin) };
  genState.durations = { ...genState.durations, [id]: durMin };
  writeJsonStore(GEN_KEYS.times, genState.times);
  writeJsonStore(GEN_KEYS.durations, genState.durations);
  paintRoute(genState.days);
};
