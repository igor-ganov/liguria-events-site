import { fitAll } from './fit-all.ts';
import { mapState } from './map-state.ts';
import { maxEventDate } from '../../lib/map/max-event-date.ts';
import { syncLayerChips } from './sync-layer-chips.ts';
import { syncMapControls } from './sync-map-controls.ts';
import { wireLayerToggles } from './wire-layer-toggles.ts';
import { wireMapFilters } from './wire-map-filters.ts';
import { whenMapReady } from './when-map-ready.ts';
import { writeMapUrl } from './write-map-url.ts';
import type { MapCameraView } from '../../lib/map/read-view.ts';
import type { MapContext } from './map-context.ts';
import type { MapLayers } from './map-layers.ts';

/**
 * Everything that reacts: the map's own load and move, and the two chip groups.
 * The registration order is the drawing order — events first (they are already
 * in the page), then the civic numbers, then the two shard-loaded layers.
 */
export const wireMapFlows = (
  context: MapContext,
  layers: MapLayers,
  saved: MapCameraView | undefined,
): void => {
  const { map } = context;
  const maxDate = maxEventDate(mapState.today)(context.events);
  // whenMapReady, not map.on('load'): these flows are wired after the corpus
  // fetch, so the style may already have loaded — see when-map-ready.ts.
  whenMapReady(map, () => {
    layers.events.rebuild();
    fitAll(context, saved);
    layers.events.draw();
  });
  map.on('moveend', () => {
    layers.events.draw();
    writeMapUrl();
  });
  whenMapReady(map, () => void layers.civics.load());
  map.on('moveend', () => void layers.civics.load());
  whenMapReady(map, layers.landmarks.onLoad);
  map.on('moveend', layers.landmarks.onMove);
  whenMapReady(map, layers.places.onLoad);
  map.on('moveend', layers.places.onMove);
  wireMapFilters(() => {
    writeMapUrl();
    syncMapControls(maxDate);
    layers.events.rebuild();
    layers.events.draw();
  });
  wireLayerToggles({
    drawEvents: layers.events.draw,
    showLandmarks: layers.landmarks.show,
    hideLandmarks: layers.landmarks.hide,
    showPlaces: layers.places.show,
    hidePlaces: layers.places.hide,
  });
  syncMapControls(maxDate);
  syncLayerChips();
};
