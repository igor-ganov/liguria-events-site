import { activeMap } from './active-map.ts';
import { addLocateControl } from './locate-control.ts';
import { createMap } from './create-map.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { loadEventsCorpus } from '../../lib/events/load-events-corpus.ts';
import { mapLayers } from './map-layers.ts';
import { mapRegion } from './map-region.ts';
import { mapToast } from './map-toast.ts';
import { readMapUrl } from './read-map-url.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { watchTheme } from './watch-theme.ts';
import { wireMapFlows } from './wire-map-flows.ts';
import { wireMapLoading } from './wire-map-loading.ts';
import type { MapContext } from './map-context.ts';

/**
 * Build the map and wire every flow onto a ready canvas.
 *
 * This module is the heavy half of the map page — it statically pulls in
 * maplibre, pmtiles and the basemap style (~1.1 MB together). It is reached
 * ONLY through the dynamic import in init-map.ts, which is what lets the page
 * shell and its loading skeleton paint before any of that arrives. Keep it that
 * way: a static import of this file from anywhere on the critical path would put
 * the whole map engine back into the page's entry chunk.
 */
export const startMap = async (canvas: HTMLElement): Promise<void> => {
  // Started first and awaited last: the corpus downloads while the engine builds
  // the map, so the two costs overlap instead of stacking.
  const corpus = loadEventsCorpus();
  const { lang, ui } = readUiIsland();
  // The address bar is read BEFORE the map exists: it decides the camera.
  const saved = readMapUrl(isoToday());
  const map = createMap(canvas, saved);
  activeMap.current = map;
  const context: MapContext = {
    map,
    canvas,
    lang,
    ui,
    events: await corpus,
    region: mapRegion(),
    say: mapToast(canvas, lang),
  };
  addLocateControl(context);
  const layers = mapLayers(context);
  watchTheme(map, layers.civics.restore);
  wireMapLoading(context);
  wireMapFlows(context, layers, saved);
};
