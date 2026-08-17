import { isCategory } from '../../lib/events/is-category.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { mapState } from './map-state.ts';
import { parseMapFilters } from '../../lib/map/parse-map-filters.ts';
import { readView } from '../../lib/map/read-view.ts';
import type { MapCameraView } from '../../lib/map/read-view.ts';

const lsBool = (key: string, fallback: boolean): boolean =>
  [localStorage.getItem(key) ?? undefined]
    .filter(isDefined)
    .map((value) => value === '1')
    .at(0) ?? fallback;

/**
 * Load the address bar into the shared state and hand back the camera the
 * visitor left. The parse itself is a tested pure function; this shell only
 * supplies the stored layer defaults (a shared link must not silently reset
 * someone's layers) and moves the result into the mutable state.
 */
export const readMapUrl = (today: string): MapCameraView | undefined => {
  const params = new URLSearchParams(location.search);
  const parsed = parseMapFilters({
    showEvents: lsBool('map-layer-events', true),
    showLandmarks: lsBool('map-layer-landmarks', false),
    showPlaces: lsBool('map-layer-places', false),
  })(params, today);
  mapState.selected.clear();
  parsed.selected.filter(isCategory).forEach((category) => mapState.selected.add(category));
  mapState.today = today;
  mapState.from = parsed.from;
  mapState.to = parsed.to;
  mapState.freeOnly = parsed.freeOnly;
  mapState.gemsOnly = parsed.gemsOnly;
  mapState.showEvents = parsed.showEvents;
  mapState.showLandmarks = parsed.showLandmarks;
  mapState.showPlaces = parsed.showPlaces;
  return readView(params);
};
