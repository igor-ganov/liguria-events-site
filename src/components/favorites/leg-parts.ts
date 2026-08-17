import { segmentText } from './segment-text.ts';
import { when } from './when.ts';
import type { Leg } from '../../lib/favorites/build-route.ts';

const ARROW = '<span class="route-leg-arrow"> → </span>';

/** The per-part breakdown of a leg. Worth showing only when a vehicle is
 *  involved or there is more than one part — a lone walk is already summed on
 *  the leg line. */
export const legParts = (leg: Leg): string => {
  const segments = leg.segments ?? [];
  const worth = segments.length > 1 || segments.some((s) => s.mode !== 'walk');
  return when(worth, `<span class="route-leg-parts">${segments.map(segmentText).join(ARROW)}</span>`);
};
