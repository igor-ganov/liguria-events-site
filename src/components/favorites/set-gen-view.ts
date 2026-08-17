import { genState } from './gen-state.ts';
import { paintRoute } from './paint-route.ts';
import { toView } from './to-view.ts';

/** Shell: switch between the itinerary list and the day timeline, repainting
 *  the last generated route rather than re-running generation. */
export const setGenView = (value: unknown): void => {
  genState.view = toView(value);
  paintRoute(genState.days);
};
