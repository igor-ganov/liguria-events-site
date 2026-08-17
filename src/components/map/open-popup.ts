import maplibregl from 'maplibre-gl';
import type { MapLibreMap, PopupOptions } from 'maplibre-gl';

/** Mount a popup on the map — the one place this page constructs one. Curried
 *  so each layer fixes its own card geometry once and then only supplies the
 *  markup, which is built by tested pure functions in src/lib/map/. */
export const openPopup =
  (map: MapLibreMap) =>
  (options: PopupOptions) =>
  (html: string, at: [number, number]): void => {
    new maplibregl.Popup(options).setLngLat(at).setHTML(html).addTo(map);
  };
