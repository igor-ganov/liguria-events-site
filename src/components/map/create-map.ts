import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { isDefined } from '../../lib/is-defined.ts';
import { MAP_ATTRIBUTION } from '../../lib/map/map-attribution.ts';
import { mapStyle } from './map-style.ts';
import { Protocol } from 'pmtiles';
import { themeKey } from './theme-key.ts';
import type { MapCameraView } from '../../lib/map/read-view.ts';
import type { MapLibreMap } from 'maplibre-gl';

/** Where the map opens when the visitor brought no camera of their own. */
const HOME: [number, number] = [8.93, 44.41];

/**
 * Build the live map: the pmtiles protocol, the current theme's style, the view
 * the visitor left (so coming back from an event opens on the map they were
 * looking at, not on the region again) and the standard controls.
 */
export const createMap = (canvas: HTMLElement, saved: MapCameraView | undefined): MapLibreMap => {
  maplibregl.addProtocol('pmtiles', new Protocol().tile);
  const map = new maplibregl.Map({
    container: canvas,
    style: mapStyle(themeKey()),
    center:
      [saved]
        .filter(isDefined)
        .map((view): [number, number] => [view.lng, view.lat])
        .at(0) ?? HOME,
    zoom: saved?.zoom ?? 9,
    attributionControl: false,
  });
  map.addControl(
    new maplibregl.AttributionControl({ compact: true, customAttribution: MAP_ATTRIBUTION }),
  );
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
  return map;
};
