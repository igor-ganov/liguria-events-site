import { activeMap } from './active-map.ts';
import { addLocateControl } from './locate-control.ts';
import { createMap } from './create-map.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { isoToday } from '../../lib/calendar/iso-today.ts';
import { mapLayers } from './map-layers.ts';
import { mapRegion } from './map-region.ts';
import { mapToast } from './map-toast.ts';
import { readEventsIsland } from '../shared/read-events-island.ts';
import { readMapUrl } from './read-map-url.ts';
import { readUiIsland } from '../shared/read-ui-island.ts';
import { watchTheme } from './watch-theme.ts';
import { wireMapFlows } from './wire-map-flows.ts';
import { wireMapLoading } from './wire-map-loading.ts';
import type { MapContext } from './map-context.ts';

const start = (canvas: HTMLElement): void => {
  canvas.dataset['ready'] = 'true';
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
    events: readEventsIsland(),
    region: mapRegion(),
    say: mapToast(canvas, lang),
  };
  addLocateControl(context);
  const layers = mapLayers(context);
  watchTheme(map, layers.civics.restore);
  wireMapLoading(context);
  wireMapFlows(context, layers, saved);
};

/** Wire the map page, once per canvas — it runs again after every SPA swap. */
export const initMap = (): void => {
  [document.querySelector<HTMLElement>('[data-map-canvas]') ?? undefined]
    .filter(isDefined)
    .filter((canvas) => canvas.dataset['ready'] !== 'true')
    .forEach(start);
};
