import { buildDaySchedule } from '../../lib/favorites/day-schedule.ts';
import { flowStartMin } from './flow-start-min.ts';
import { GEN_KEYS } from './gen-keys.ts';
import { genDayWindow } from './gen-day-window.ts';
import { genState } from './gen-state.ts';
import { moveStopToIndex } from './route-edit-ops.ts';
import { omitKey } from './omit-key.ts';
import { paintRoute } from './paint-route.ts';
import { routeFromGroups } from '../../lib/favorites/build-route.ts';
import { stopsOfDay } from './stops-of-day.ts';
import { timesAfterMove } from './times-after-move.ts';
import { writeJsonStore } from './write-json-store.ts';

/** Shell: a timeline drag-to-reorder — put the stop at the drop index, rebuild
 *  the legs, and pin it to the drop time only if that leaves a real gap. */
export const genApplyMove = (id: string, day: string, index: number, startMin: number): void => {
  const current = genState.days.map((d) => ({ day: d.day, ids: d.stops.map((s) => s.id) }));
  const next = moveStopToIndex(current, id, day, index);
  genState.order = Object.fromEntries(next.map((group) => [group.day, [...group.ids]]));
  writeJsonStore(GEN_KEYS.order, genState.order);
  genState.days = routeFromGroups(next, genState.mode, genState.byId);
  const unpinned = omitKey(genState.times, id);
  const schedule = buildDaySchedule(
    stopsOfDay(genState.days, day),
    genState.mode,
    unpinned,
    genState.durations,
    genState.pauses,
    genDayWindow(day).startMin,
  );
  genState.times = timesAfterMove(genState.times, id, startMin, flowStartMin(schedule, id, startMin));
  writeJsonStore(GEN_KEYS.times, genState.times);
  paintRoute(genState.days);
};
