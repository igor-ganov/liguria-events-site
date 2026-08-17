import { genState } from './gen-state.ts';
import { nextDayHours } from './next-day-hours.ts';
import { paintRoute } from './paint-route.ts';

/** Shell: a per-day window override set on the timeline day header. In-memory
 *  only — a generated route is not a saved one. */
export const setGenDayHours = (changed: HTMLInputElement): void => {
  const box = changed.closest('.tl-day-hours') ?? document;
  genState.dayHours = nextDayHours(
    genState.dayHours,
    changed.dataset['day'] ?? '',
    box.querySelector<HTMLInputElement>('[data-day-start]')?.value ?? '',
    box.querySelector<HTMLInputElement>('[data-day-end]')?.value ?? '',
  );
  paintRoute(genState.days);
};
