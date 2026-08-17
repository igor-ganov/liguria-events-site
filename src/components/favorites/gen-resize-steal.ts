import { GEN_KEYS } from './gen-keys.ts';
import { genState } from './gen-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { paintRoute } from './paint-route.ts';
import { stealDurations } from './steal-durations.ts';
import { stopsOfDay } from './stops-of-day.ts';
import { writeJsonStore } from './write-json-store.ts';

/** Shell: a timeline edge-drag — resize the stop, taking the minutes off the
 *  stops that follow it. A stop the day no longer holds changes nothing. */
export const genResizeSteal = (id: string, day: string, newDur: number): void => {
  const stops = stopsOfDay(genState.days, day);
  [stealDurations(stops, id, newDur, genState.durations)]
    .filter(isDefined)
    .forEach((durations) => {
      genState.durations = durations;
      writeJsonStore(GEN_KEYS.durations, durations);
      paintRoute(genState.days);
    });
};
