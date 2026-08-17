import { mapState } from './map-state.ts';
import { queryAll } from '../../lib/dom/query-all.ts';
import { setPressed } from '../../lib/dom/set-pressed.ts';

/** Redraw the three layer chips from the state, and fold the event filters away
 *  with the events layer — while that layer is off they filter nothing, so the
 *  toolbar would be claiming more than the map is showing. */
export const syncLayerChips = (): void => {
  setPressed(document.querySelector('[data-map-events]') ?? undefined, mapState.showEvents);
  setPressed(document.querySelector('[data-map-landmarks]') ?? undefined, mapState.showLandmarks);
  setPressed(document.querySelector('[data-map-places]') ?? undefined, mapState.showPlaces);
  queryAll(document, '[data-map-event-filters], [data-map-event-chips]').forEach((el) =>
    el.toggleAttribute('hidden', !mapState.showEvents),
  );
};
