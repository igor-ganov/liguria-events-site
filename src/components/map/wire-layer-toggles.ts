import { branch } from '../../lib/branch.ts';
import { mapState } from './map-state.ts';
import { onClick } from '../../lib/dom/on-click.ts';
import { syncLayerChips } from './sync-layer-chips.ts';
import { writeMapUrl } from './write-map-url.ts';
import type { LayerActions } from './layer-actions.ts';

/**
 * The three layer chips. Each flips its toggle, persists it (localStorage for
 * the next visit, the query for this link) and then either draws its markers or
 * drops them. Events differ only in that they are already loaded, so switching
 * them is a redraw rather than a fetch.
 */
export const wireLayerToggles = (actions: LayerActions): void => {
  const after = (): void => {
    writeMapUrl();
    syncLayerChips();
  };
  onClick('[data-map-events]', () => {
    mapState.showEvents = !mapState.showEvents;
    after();
    actions.drawEvents();
  });
  onClick('[data-map-landmarks]', () => {
    mapState.showLandmarks = !mapState.showLandmarks;
    after();
    branch(mapState.showLandmarks)(actions.showLandmarks, actions.hideLandmarks);
  });
  onClick('[data-map-places]', () => {
    mapState.showPlaces = !mapState.showPlaces;
    after();
    branch(mapState.showPlaces)(actions.showPlaces, actions.hidePlaces);
  });
};
