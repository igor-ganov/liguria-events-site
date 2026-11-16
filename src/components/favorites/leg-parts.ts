import { segmentText } from './segment-text.ts';
import { when } from './when.ts';
import { uiIcon } from '../../lib/icons/ui-icon.ts';
import type { Leg } from '../../lib/favorites/build-route.ts';
import type { Ui } from './render-types.ts';

const ARROW = `<span class="route-leg-arrow">${uiIcon('arrowRight', '1em')}</span>`;

/** The per-part breakdown of a leg. Worth showing only when a vehicle is
 *  involved or there is more than one part — a lone walk is already summed on
 *  the leg line. */
export const legParts = (leg: Leg, ui: Ui): string => {
  const segments = leg.segments ?? [];
  const worth = segments.length > 1 || segments.some((s) => s.mode !== 'walk');
  return when(worth, `<span class="route-leg-parts">${segments.map(segmentText(ui)).join(ARROW)}</span>`);
};
